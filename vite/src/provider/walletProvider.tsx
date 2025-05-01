import { useState, useContext, createContext, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { WebUploader } from "@irys/web-upload";
import { WebEthereum } from "@irys/web-upload-ethereum";
import { EthersV6Adapter } from "@irys/web-upload-ethereum-ethers-v6";
import { DataContext } from "./dataProvider";

export const WalletContext = createContext();

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
    console.log("start connect to ETH wallet");

    if (typeof window.ethereum === 'undefined') {
      console.error("No Ethereum provider found. Please install MetaMask or another wallet.");
      setWalletStatus("No Ethereum provider found. Please install MetaMask or another wallet.");
      return;
    }

    try {
      setLoading(true);
      // connect to wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletStatus(`Connected: ${address}, Network: ${network.name}`);
      // update context with provider 
      updateData({ ethProvider: provider });
      console.log("ETH provider updated in context:", provider);
      
      // Fetch factory information after wallet connection
      await fetchFactoryInfo(provider);
      
      // connect to Irys
      const irysUploader = await WebUploader(WebEthereum).withAdapter(EthersV6Adapter(provider)).withRpc("https://testnet-explorer.irys.xyz/").devnet();
      setIrysStatus(`Connected to Irys: ${irysUploader.address}`);
      // update context with Irys uploader
      updateData({ irysUploader: irysUploader });
      console.log("Irys uploader updated in context:", irysUploader);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      setWalletStatus("Error connecting to wallet");
      setSnackbar({ 
        open: true, 
        message: "Failed to connect wallet: " + (error?.message || error), 
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
  const handleChainChanged = useCallback(async () => {
    console.log("Chain changed, silently updating wallet info");
    // Only update wallet info without showing any notifications
    if (data.ethProvider) {
      refreshWalletInfo();
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
      refreshIrysBalance
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export { WalletProvider };
export default WalletProvider;