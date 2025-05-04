import { useState, useContext, createContext, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { WebUploader } from "@irys/web-upload";
import { WebEthereum } from "@irys/web-upload-ethereum";
import { EthersV6Adapter } from "@irys/web-upload-ethereum-ethers-v6";
import { DataContext } from "./dataProvider";

// Network and connection constants
const NETWORKS = {
  SEPOLIA: {
    chainId: "0xaa36a7",
    chainName: "Sepolia",
    rpcUrls: ["https://rpc.sepolia.org"], 
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://sepolia.etherscan.io"]
  },
  HOODI: {
    chainId: "0x88bb0",
    chainName: "Hoodi Testnet",
    rpcUrls: ["https://0xrpc.io/hoodi"], 
    nativeCurrency: {
      name: "Hoodi Ether",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://hoodi.etherscan.io/"]
  }
};

const CONNECTION_STATES = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING_SEPOLIA: 'CONNECTING_SEPOLIA',
  CONNECTING_HOODI: 'CONNECTING_HOODI',
  CONNECTED: 'CONNECTED'
};

const NETWORK_SWITCH_DELAY = 2000;
const RECONNECT_COOLDOWN = 5000;

// Default wallet info state
const DEFAULT_WALLET_INFO = {
  address: null,
  providerName: 'N/A',
  network: 'N/A',
  ethBalance: 'N/A',
  isConnected: false
};

// Create context with default values
export const WalletContext = createContext({
  walletStatus: "Not connected",
  irysStatus: "Not connected",
  connectWallet: async () => {},
  fetchFactoryInfo: async () => {},
  walletInfo: DEFAULT_WALLET_INFO,
  irysBalance: 'N/A',
  loading: false,
  snackbar: { open: false, message: '', severity: 'success' },
  closeSnackbar: () => {},
  fundAccount: async () => {},
  withdrawAccount: async () => {},
  refreshWalletInfo: async () => {},
  refreshIrysBalance: async () => {},
  currentNetwork: null,
  switchNetwork: async () => false,
  NETWORKS
});

function WalletProvider({children}) {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.DISCONNECTED);
  const [lastSuccessfulConnection, setLastSuccessfulConnection] = useState(null);
  const [lastNetworkSwitch, setLastNetworkSwitch] = useState(null);

  const dataContext = useContext(DataContext) || {};
  const { data = {}, updateData = () => {} } = dataContext;
  const [walletStatus, setWalletStatus] = useState("Not connected");
  const [irysStatus, setIrysStatus] = useState("Not connected");
  
  const [walletInfo, setWalletInfo] = useState(DEFAULT_WALLET_INFO);
  const [irysBalance, setIrysBalance] = useState('N/A');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [networkInitialized, setNetworkInitialized] = useState(false);

  const switchNetwork = async (networkConfig) => {
    if (!window.ethereum || isSwitchingNetwork) return false;
    
    if (lastNetworkSwitch && Date.now() - lastNetworkSwitch < NETWORK_SWITCH_DELAY) {
      console.log("Network switch too rapid, waiting...");
      await new Promise(resolve => setTimeout(resolve, NETWORK_SWITCH_DELAY));
    }
    
    try {
      setIsSwitchingNetwork(true);
      setLastNetworkSwitch(Date.now());
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
      
      await new Promise(resolve => setTimeout(resolve, NETWORK_SWITCH_DELAY));
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
          await new Promise(resolve => setTimeout(resolve, NETWORK_SWITCH_DELAY));
          return true;
        } catch (addError) {
          console.error("Error adding network:", addError);
          return false;
        }
      }
      console.error("Error switching network:", switchError);
      return false;
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const fetchFactoryInfo = async (provider) => {
    try {
      if (!provider || !data.masterFactoryAddress) {
        console.warn("Provider or factory address not available");
        return;
      }

      const { ethers } = await import('ethers');
      
      const masterFactoryABI = [
        "function getCurrentVer() view returns (address, address, address)",
        "function broadcastFactoryCurrentVer() view returns (uint256)",
        "function publicFactoryCurrentVer() view returns (uint256)",
        "function privateFactoryCurrentVer() view returns (uint256)"
      ];
      
      const masterFactory = new ethers.Contract(
        data.masterFactoryAddress,
        masterFactoryABI,
        provider
      );
      
      const [broadcastFactoryAddr, publicFactoryAddr, privateFactoryAddr] = 
        await masterFactory.getCurrentVer();
      
      const [broadcastVersion, publicVersion, privateVersion] = await Promise.all([
        masterFactory.broadcastFactoryCurrentVer(),
        masterFactory.publicFactoryCurrentVer(),
        masterFactory.privateFactoryCurrentVer()
      ]);
      
      console.log("Factory information fetched:", {
        broadcast: { version: Number(broadcastVersion), address: broadcastFactoryAddr },
        public: { version: Number(publicVersion), address: publicFactoryAddr },
        private: { version: Number(privateVersion), address: privateFactoryAddr }
      });
      
      updateData({
        broadcastFactory: {
          version: Number(broadcastVersion),
          address: broadcastFactoryAddr,
        },
        publicFactory: {
          version: Number(publicVersion),
          address: publicFactoryAddr,
        },
        privateFactory: {
          version: Number(privateVersion),
          address: privateFactoryAddr,
        }
      });
      
    } catch (error) {
      console.error("Error fetching factory information:", error);
    }
  };

  const refreshWalletInfo = async () => {
    if (!data.ethProvider) {
      setWalletInfo(DEFAULT_WALLET_INFO);
      return;
    }

    try {
      const signer = await data.ethProvider.getSigner();
      const addr = await signer.getAddress();
      const providerName = window.ethereum?.isMetaMask ? 'MetaMask' : 'Injected';
      const networkObj = await data.ethProvider.getNetwork();
      const network = networkObj.name || networkObj.chainId;
      const balance = await data.ethProvider.getBalance(addr);
      const ethBalance = Number(balance) / 1e18 + ' ETH';
      
      setWalletInfo({
        address: addr,
        providerName,
        network,
        ethBalance,
        isConnected: true
      });
    } catch (error) {
      console.error("Error refreshing wallet info:", error);
      setWalletInfo(DEFAULT_WALLET_INFO);
    }
  };

  const refreshIrysBalance = async () => {
    if (data.irysUploader && walletInfo.address) {
      try {
        const bal = await data.irysUploader.getBalance();
        setIrysBalance(Number(bal) / 1e18 + ' ETH');
      } catch (error) {
        console.error("Error refreshing Irys balance:", error);
        setIrysBalance('N/A');
      }
    } else {
      setIrysBalance('N/A');
    }
  };

  const fundAccount = async (amount = "0.01") => {
    setLoading(true);
    try {
      if (data.irysUploader) {
        await data.irysUploader.fund(ethers.parseEther(amount));
        setSnackbar({ open: true, message: `Funded ${amount} ETH to Irys wallet!`, severity: "success" });
        await refreshIrysBalance();
        await refreshWalletInfo();
      } else {
        setSnackbar({ open: true, message: "Irys uploader not connected.", severity: "error" });
      }
    } catch (e) {
      setSnackbar({ open: true, message: "Failed to fund Irys wallet: " + (e?.message || e), severity: "error" });
    }
    setLoading(false);
  };

  const withdrawAccount = async () => {
    setLoading(true);
    try {
      if (data.irysUploader) {
        await data.irysUploader.withdraw();
        setSnackbar({ open: true, message: "Withdrawn from Irys wallet!", severity: "success" });
        await refreshIrysBalance();
        await refreshWalletInfo();
      } else {
        setSnackbar({ open: true, message: "Irys uploader not connected.", severity: "error" });
      }
    } catch (e) {
      setSnackbar({ open: true, message: "Failed to withdraw from Irys: " + (e?.message || e), severity: "error" });
    }
    setLoading(false);
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const resetWalletState = useCallback(() => {
    setWalletInfo(DEFAULT_WALLET_INFO);
    setIrysBalance('N/A');
    setWalletStatus("Not connected");
    setIrysStatus("Not connected");
    updateData({ ethProvider: null, sepoliaProvider: null, irysUploader: null });
    setConnectionState(CONNECTION_STATES.DISCONNECTED);
  }, [updateData]);

  const connectWallet = useCallback(async () => {
    if (isReconnecting || connectionState !== CONNECTION_STATES.DISCONNECTED) {
      console.log("Connection in progress or already connected, skipping...");
      return;
    }

    if (lastSuccessfulConnection && Date.now() - lastSuccessfulConnection < RECONNECT_COOLDOWN) {
      console.log("Too soon to reconnect, waiting for cooldown...");
      return;
    }

    try {
      setIsReconnecting(true);
      setConnectionState(CONNECTION_STATES.CONNECTING_SEPOLIA);
      
      updateData({ 
        ethProvider: null, 
        sepoliaProvider: null, 
        irysUploader: null 
      });

      setLoading(true);

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      console.log("Connecting to Sepolia for Irys...");
      setSnackbar({
        open: true,
        message: "Connecting to Sepolia for Irys integration...",
        severity: "info"
      });
      
      const switchedToSepolia = await switchNetwork(NETWORKS.SEPOLIA);
      if (!switchedToSepolia) {
        throw new Error("Failed to switch to Sepolia network");
      }
      
      const sepoliaProvider = new ethers.BrowserProvider(window.ethereum);
      const sepoliaSigner = await sepoliaProvider.getSigner();
      const address = await sepoliaSigner.getAddress();
      const sepoliaNetwork = await sepoliaProvider.getNetwork();
      
      const irysUploader = await WebUploader(WebEthereum)
        .withAdapter(EthersV6Adapter(sepoliaProvider))
        .withRpc("https://testnet-explorer.irys.xyz/")
        .devnet();
      
      setIrysStatus(`Connected to Irys: ${irysUploader.address}`);
      
      updateData({ 
        sepoliaProvider: sepoliaProvider,
        irysUploader: irysUploader 
      });
      
      console.log("Successfully connected to Sepolia and Irys");
      setSnackbar({
        open: true,
        message: "Connected to Sepolia for Irys. Switching to Hoodi for contracts...",
        severity: "info"
      });
      
      setConnectionState(CONNECTION_STATES.CONNECTING_HOODI);
      console.log("Connecting to Hoodi Testnet for contracts...");
      
      await new Promise(resolve => setTimeout(resolve, NETWORK_SWITCH_DELAY));

      const switchedToHoodi = await switchNetwork(NETWORKS.HOODI);
      if (!switchedToHoodi) {
        throw new Error("Failed to switch to Hoodi network");
      }
      
      const hoodiProvider = new ethers.BrowserProvider(window.ethereum);
      const hoodiNetwork = await hoodiProvider.getNetwork();
      
      setWalletStatus(`Connected: ${address}, Network: ${hoodiNetwork.name || 'Hoodi Testnet'}`);
      setCurrentNetwork(hoodiNetwork.name || 'Hoodi Testnet');
      
      updateData({ 
        ethProvider: hoodiProvider 
      });
      
      await fetchFactoryInfo(hoodiProvider);
      
      console.log("Successfully connected to Hoodi and fetched factory data");
      setSnackbar({
        open: true,
        message: "Successfully connected to both networks!",
        severity: "success"
      });
      
      await refreshWalletInfo();
      await refreshIrysBalance();

      setConnectionState(CONNECTION_STATES.CONNECTED);
      setLastSuccessfulConnection(Date.now());

    } catch (error) {
      console.error("Error in multi-network connection process:", error);
      setWalletStatus("Connection error");
      setSnackbar({ 
        open: true, 
        message: "Connection failed: " + (error?.message || error), 
        severity: "error" 
      });
      setConnectionState(CONNECTION_STATES.DISCONNECTED);
    } finally {
      setLoading(false);
      setNetworkInitialized(true);
      setIsReconnecting(false);
    }
  }, [updateData, fetchFactoryInfo, isReconnecting, connectionState, lastSuccessfulConnection]);

  const handleAccountsChanged = useCallback(async (accounts) => {
    if (isReconnecting) return;

    console.log("Accounts changed:", accounts);
    if (accounts.length === 0) {
      resetWalletState();
    } else {
      const newAddress = accounts[0];
      if (newAddress?.toLowerCase() !== walletInfo.address?.toLowerCase()) {
        setSnackbar({
          open: true,
          message: "Account changed. Reconnecting...",
          severity: "info"
        });
        await connectWallet();
      }
    }
  }, [connectWallet, resetWalletState, walletInfo.address, isReconnecting]);

  const handleChainChanged = useCallback(async (chainId) => {
    if (isReconnecting || isSwitchingNetwork) {
      console.log("Ignoring chain change during connection/switch");
      return;
    }

    if (lastNetworkSwitch && Date.now() - lastNetworkSwitch < NETWORK_SWITCH_DELAY) {
      console.log("Ignoring rapid chain change");
      return;
    }

    console.log("Chain changed to:", chainId);
    
    if (!networkInitialized) {
      if (data.ethProvider) {
        refreshWalletInfo();
      }
      
      const newChainIdHex = typeof chainId === 'string' && chainId.startsWith('0x') 
        ? chainId.toLowerCase() 
        : '0x' + Number(chainId).toString(16);
      
      if (newChainIdHex === NETWORKS.SEPOLIA.chainId.toLowerCase()) {
        setCurrentNetwork('Sepolia');
      } else if (newChainIdHex === NETWORKS.HOODI.chainId.toLowerCase()) {
        setCurrentNetwork('Hoodi Testnet');
      } else {
        setCurrentNetwork('Unknown Network');
      }
      
      setNetworkInitialized(true);
    }
  }, [data.ethProvider, networkInitialized, isReconnecting, isSwitchingNetwork, connectionState, lastNetworkSwitch]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [handleAccountsChanged, handleChainChanged]);

  useEffect(() => {
    const attemptReconnect = async () => {
      if (isReconnecting || 
          (lastSuccessfulConnection && Date.now() - lastSuccessfulConnection < RECONNECT_COOLDOWN) ||
          connectionState !== CONNECTION_STATES.DISCONNECTED) {
        return;
      }

      if (window.ethereum?.isConnected && window.ethereum?.selectedAddress) {
        const currentConnectedAddress = window.ethereum.selectedAddress;
        if (!walletInfo.isConnected || 
            currentConnectedAddress.toLowerCase() !== walletInfo.address?.toLowerCase()) {
          try {
            await connectWallet();
          } catch (error) {
            console.error("Auto-reconnect failed:", error);
          }
        }
      }
    };
    
    attemptReconnect();
  }, [connectWallet, walletInfo.isConnected, walletInfo.address, isReconnecting, connectionState, lastSuccessfulConnection]);

  useEffect(() => {
    if (!walletInfo.isConnected) {
      setNetworkInitialized(false);
    }
  }, [walletInfo.isConnected]);

  useEffect(() => {
    refreshWalletInfo();
  }, [data.ethProvider]);

  useEffect(() => {
    refreshIrysBalance();
  }, [data.irysUploader, walletInfo.address]);

  useEffect(() => {
    if (data.ethProvider) {
      fetchFactoryInfo(data.ethProvider);
    }
  }, [data.ethProvider, data.masterFactoryAddress]);

  return (
    <WalletContext.Provider value={{ 
      walletStatus, 
      irysStatus, 
      connectWallet,
      fetchFactoryInfo,
      walletInfo,
      irysBalance,
      loading,
      snackbar,
      closeSnackbar,
      fundAccount,
      withdrawAccount,
      refreshWalletInfo,
      refreshIrysBalance,
      currentNetwork,
      switchNetwork,
      NETWORKS
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export { WalletProvider };
export default WalletProvider;