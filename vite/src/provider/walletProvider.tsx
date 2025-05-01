import { useState, useContext, createContext, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { WebUploader } from "@irys/web-upload";
import { WebEthereum } from "@irys/web-upload-ethereum";
import { EthersV6Adapter } from "@irys/web-upload-ethereum-ethers-v6";
import { DataContext } from "./dataProvider";

// Network configuration constants
const NETWORKS = {
  SEPOLIA: {
    chainId: "0xaa36a7", // 11155111 in hex
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
    chainId: "0x88bb0", // 938 in hex
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

// Create context with default values to avoid undefined errors
export const WalletContext = createContext({
  walletStatus: "Not connected",
  irysStatus: "Not connected",
  connectWallet: async () => {},
  fetchFactoryInfo: async () => {},
  walletInfo: {
    address: null,
    providerName: 'N/A',
    network: 'N/A',
    ethBalance: 'N/A',
    isConnected: false
  },
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
  NETWORKS: {
    SEPOLIA: {
      chainId: "0xaa36a7", // 11155111 in hex
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
      chainId: "0x88bb0", // 938 in hex
      chainName: "Hoodi Testnet",
      rpcUrls: ["https://0xrpc.io/hoodi"], 
      nativeCurrency: {
        name: "Hoodi Ether",
        symbol: "ETH",
        decimals: 18
      },
      blockExplorerUrls: ["https://hoodi.etherscan.io/"]
    }
  }
});

function WalletProvider({children}) {
  // Fix: Provide fallback if DataContext is not available
  const dataContext = useContext(DataContext) || {};
  const { data = {}, updateData = () => {} } = dataContext;
  const [walletStatus, setWalletStatus] = useState("Not connected");
  const [irysStatus, setIrysStatus] = useState("Not connected");
  
  // Wallet and Irys information states
  const [walletInfo, setWalletInfo] = useState({
    address: null,
    providerName: 'N/A',
    network: 'N/A',
    ethBalance: 'N/A',
    isConnected: false
  });
  const [irysBalance, setIrysBalance] = useState('N/A');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentNetwork, setCurrentNetwork] = useState(null);

  // Helper function to switch network
  const switchNetwork = async (networkConfig) => {
    if (!window.ethereum) return false;
    
    try {
      // Try to switch to the network if it's already added in the wallet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
      return true;
    } catch (switchError) {
      // If the network is not added yet, add it to the wallet
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
          return true;
        } catch (addError) {
          console.error("Error adding network:", addError);
          return false;
        }
      }
      console.error("Error switching network:", switchError);
      return false;
    }
  };

  // Function to fetch factory information from master contract
  const fetchFactoryInfo = async (provider) => {
    try {
      if (!provider || !data.masterFactoryAddress) {
        console.warn("Provider or factory address not available");
        return;
      }

      const { ethers } = await import('ethers');
      
      // Master Factory ABI (minimal required for this operation)
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
      
      // Get current factory addresses
      const [broadcastFactoryAddr, publicFactoryAddr, privateFactoryAddr] = 
        await masterFactory.getCurrentVer();
      
      // Get current version numbers
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
      
      // Update global state with factory information
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

  // Helper to refresh wallet balance and info
  const refreshWalletInfo = async () => {
    if (data.ethProvider) {
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
        setWalletInfo({
          address: null,
          providerName: 'N/A',
          network: 'N/A',
          ethBalance: 'N/A',
          isConnected: false
        });
      }
    } else {
      setWalletInfo({
        address: null,
        providerName: 'N/A',
        network: 'N/A',
        ethBalance: 'N/A',
        isConnected: false
      });
    }
  };

  // Helper to refresh irys balance
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

  // Fund Irys account
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

  // Withdraw from Irys account
  const withdrawAccount = async () => {
    setLoading(true);
    try {
      if (data.irysUploader) {
        // Get the balance and withdraw everything
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

  // Close snackbar
  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Using useCallback to ensure this function's reference doesn't change
  const connectWallet = useCallback(async () => {
    console.log("Starting multi-network wallet connection process");

    if (typeof window.ethereum === 'undefined') {
      console.error("No Ethereum provider found. Please install MetaMask or another wallet.");
      setWalletStatus("No Ethereum provider found. Please install MetaMask or another wallet.");
      return;
    }

    try {
      setLoading(true);

      // First, request accounts access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Connect to Sepolia first for Irys
      console.log("Connecting to Sepolia for Irys...");
      setSnackbar({
        open: true,
        message: "Connecting to Sepolia for Irys integration...",
        severity: "info"
      });
      
      // Switch to Sepolia network
      const switchedToSepolia = await switchNetwork(NETWORKS.SEPOLIA);
      if (!switchedToSepolia) {
        throw new Error("Failed to switch to Sepolia network");
      }
      
      // Create Sepolia provider
      const sepoliaProvider = new ethers.BrowserProvider(window.ethereum);
      const sepoliaSigner = await sepoliaProvider.getSigner();
      const address = await sepoliaSigner.getAddress();
      const sepoliaNetwork = await sepoliaProvider.getNetwork();
      
      // Connect to Irys on Sepolia
      const irysUploader = await WebUploader(WebEthereum)
        .withAdapter(EthersV6Adapter(sepoliaProvider))
        .withRpc("https://testnet-explorer.irys.xyz/")
        .devnet();
      
      setIrysStatus(`Connected to Irys: ${irysUploader.address}`);
      
      // Store the Sepolia provider and Irys uploader in context
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
      
      // Now switch to Hoodi for contract interactions
      console.log("Connecting to Hoodi Testnet for contracts...");
      
      // Switch to Hoodi network
      const switchedToHoodi = await switchNetwork(NETWORKS.HOODI);
      if (!switchedToHoodi) {
        throw new Error("Failed to switch to Hoodi network");
      }
      
      // Create Hoodi provider
      const hoodiProvider = new ethers.BrowserProvider(window.ethereum);
      const hoodiNetwork = await hoodiProvider.getNetwork();
      
      setWalletStatus(`Connected: ${address}, Network: ${hoodiNetwork.name || 'Hoodi Testnet'}`);
      setCurrentNetwork(hoodiNetwork.name || 'Hoodi Testnet');
      
      // Store the Hoodi provider in context
      updateData({ 
        ethProvider: hoodiProvider 
      });
      
      // Fetch factory information from the Hoodi network
      await fetchFactoryInfo(hoodiProvider);
      
      console.log("Successfully connected to Hoodi and fetched factory data");
      setSnackbar({
        open: true,
        message: "Successfully connected to both networks!",
        severity: "success"
      });
      
      // Update UI with the current network (Hoodi)
      await refreshWalletInfo();
      await refreshIrysBalance();

    } catch (error) {
      console.error("Error in multi-network connection process:", error);
      setWalletStatus("Connection error");
      setSnackbar({ 
        open: true, 
        message: "Connection failed: " + (error?.message || error), 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  }, [updateData, fetchFactoryInfo]);

  // Handle account changes in wallet (e.g., MetaMask)
  const handleAccountsChanged = useCallback(async (accounts) => {
    console.log("Accounts changed:", accounts);
    if (accounts.length === 0) {
      // User disconnected their wallet
      setSnackbar({
        open: true,
        message: "Wallet disconnected",
        severity: "info"
      });
      setWalletInfo({
        address: null,
        providerName: 'N/A',
        network: 'N/A',
        ethBalance: 'N/A',
        isConnected: false
      });
      setIrysBalance('N/A');
      setWalletStatus("Not connected");
      setIrysStatus("Not connected");
      updateData({ ethProvider: null, irysUploader: null });
    } else {
      // Check if the account address has actually changed
      const newAddress = accounts[0];
      if (newAddress?.toLowerCase() !== walletInfo.address?.toLowerCase()) {
        // Address has changed - reconnect
        setSnackbar({
          open: true,
          message: "Account changed. Reconnecting...",
          severity: "info"
        });
        await connectWallet();
      } else {
        console.log("Account event triggered but address is the same. Skipping reconnect.");
      }
    }
  }, [connectWallet, updateData, walletInfo.address]);

  // Handle chain changes in wallet - just update info silently without notification
  const handleChainChanged = useCallback(async (chainId) => {
    console.log("Chain changed to:", chainId);
    
    // Update wallet info for the new chain
    if (data.ethProvider) {
      refreshWalletInfo();
    }
    
    // Determine which network we're on now
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
  }, [data.ethProvider]);

  // Set up event listeners for wallet account or chain changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Clean up event listeners
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [handleAccountsChanged, handleChainChanged]);

  // Auto reconnect if wallet was previously connected
  useEffect(() => {
    const attemptReconnect = async () => {
      if (window.ethereum && window.ethereum.isConnected && window.ethereum.selectedAddress) {
        const currentConnectedAddress = window.ethereum.selectedAddress;
        // Only reconnect if there's no current connection or the address is different
        if (!walletInfo.isConnected || 
            currentConnectedAddress.toLowerCase() !== walletInfo.address?.toLowerCase()) {
          try {
            console.log("Detected connected wallet, re-establishing connection");
            await connectWallet();
          } catch (error) {
            console.error("Auto-reconnect failed:", error);
          }
        }
      }
    };
    
    attemptReconnect();
  }, [connectWallet, walletInfo.isConnected, walletInfo.address]);

  // Update wallet and Irys info when provider changes
  useEffect(() => {
    refreshWalletInfo();
  }, [data.ethProvider]);

  useEffect(() => {
    refreshIrysBalance();
  }, [data.irysUploader, walletInfo.address]);

  // Auto-fetch factory info when provider changes
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