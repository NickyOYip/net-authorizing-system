import { useState, useContext, createContext, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { WebUploader } from "@irys/web-upload";
import { WebEthereum } from "@irys/web-upload-ethereum";
import { EthersV6Adapter } from "@irys/web-upload-ethereum-ethers-v6";
import { DataContext } from "./dataProvider";
import { NETWORKS, switchNetwork } from "../utils/networkUtils";
import { checkBalance, fundAccount, withdrawAccount } from '../hooks/irysHook/irysAction';

// Debug logging function
const debug = {
  log: (...args) => console.log('[Wallet]', ...args),
  error: (...args) => console.error('[Wallet Error]', ...args),
  warn: (...args) => console.warn('[Wallet Warning]', ...args),
  info: (...args) => console.info('[Wallet Info]', ...args),
};

const DEFAULT_WALLET_INFO = {
  address: null,
  network: 'N/A',
  ethBalance: 'N/A',
  sepoliaBalance: 'N/A',
  isConnected: false
};

export const WalletContext = createContext({
  connectWallet: async () => {},
  walletInfo: DEFAULT_WALLET_INFO,
  irysBalance: 'N/A',
  loading: false,
  error: null,
  fundIrys: async () => {},
  withdrawIrys: async () => {},
  refreshWalletInfo: async () => {},
});

function WalletProvider({children}) {
  const { data = {}, updateData = () => {} } = useContext(DataContext);
  const [walletInfo, setWalletInfo] = useState(DEFAULT_WALLET_INFO);
  const [irysBalance, setIrysBalance] = useState('N/A');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const prepareIrysNetwork = async () => {
    try {
      debug.log('Preparing network for Irys operation');
      await switchNetwork(NETWORKS.SEPOLIA);
      return true;
    } catch (error) {
      debug.error('Failed to prepare network for Irys:', error);
      return false;
    }
  };

  const fetchFactoryInfo = async (provider) => {
    if (!provider || !data.masterFactoryAddress) {
      debug.warn('Missing provider or master factory address', { 
        provider: !!provider, 
        masterFactoryAddress: data.masterFactoryAddress 
      });
      return;
    }

    try {
      debug.log('Fetching factory addresses from master contract');
      const masterFactoryABI = [
        "function getCurrentVer() view returns (address, address, address)",
      ];
      
      const masterFactory = new ethers.Contract(
        data.masterFactoryAddress,
        masterFactoryABI,
        provider
      );
      
      const [broadcastAddr, publicAddr, privateAddr] = await masterFactory.getCurrentVer();
      debug.info('Factory addresses fetched:', {
        broadcast: broadcastAddr,
        public: publicAddr,
        private: privateAddr
      });
      
      updateData({
        broadcastFactory: { address: broadcastAddr },
        publicFactory: { address: publicAddr },
        privateFactory: { address: privateAddr },
      });
    } catch (error) {
      debug.error("Factory fetch failed:", error);
    }
  };

  const updateBalances = async (hoodiProvider, sepoliaProvider, address) => {
    debug.log('Updating balances for address:', address);
    try {
      // First switch to Hoodi for Hoodi balance
      await switchNetwork(NETWORKS.HOODI);
      const hoodiBalance = await hoodiProvider.getBalance(address);
      debug.info('Hoodi balance:', ethers.formatEther(hoodiBalance));

      // Then switch to Sepolia for Sepolia balance
      await switchNetwork(NETWORKS.SEPOLIA);
      const sepoliaBalance = await sepoliaProvider.getBalance(address);
      debug.info('Sepolia balance:', ethers.formatEther(sepoliaBalance));

      // Switch back to Hoodi as main network
      await switchNetwork(NETWORKS.HOODI);

      setWalletInfo(prev => ({
        ...prev,
        ethBalance: `${ethers.formatEther(hoodiBalance)} ETH`,
        sepoliaBalance: `${ethers.formatEther(sepoliaBalance)} ETH`
      }));
    } catch (error) {
      debug.error('Error updating balances:', error);
    }
  };

  const connectWallet = useCallback(async () => {
    if (isConnecting) {
      debug.warn('Connection already in progress');
      return;
    }

    try {
      setIsConnecting(true);
      debug.log('Starting wallet connection process');
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('No ethereum provider found');
      }

      debug.log('Requesting account access');
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      debug.log('Switching to Sepolia for Irys');
      await switchNetwork(NETWORKS.SEPOLIA);
      
      debug.log('Setting up Sepolia provider and Irys');
      const sepoliaProvider = new ethers.BrowserProvider(window.ethereum);
      const irysUploader = await WebUploader(WebEthereum)
        .withAdapter(EthersV6Adapter(sepoliaProvider))
        .withRpc("https://testnet-explorer.irys.xyz/")
        .devnet();

      debug.log('Switching to Hoodi network');
      await switchNetwork(NETWORKS.HOODI);
      const hoodiProvider = new ethers.BrowserProvider(window.ethereum);
      
      debug.info('Updating providers in context');
      updateData({ 
        ethProvider: hoodiProvider,
        sepoliaProvider,
        irysUploader 
      });

      debug.log('Getting signer and wallet info');
      const signer = await hoodiProvider.getSigner();
      const address = await signer.getAddress();
      
      // Update balances with network switching
      await updateBalances(hoodiProvider, sepoliaProvider, address);
      
      setWalletInfo(prev => ({
        ...prev,
        address,
        network: 'Hoodi Testnet',
        isConnected: true
      }));

      await fetchFactoryInfo(hoodiProvider);
      await refreshIrysBalance(irysUploader);

    } catch (error) {
      debug.error("Connection failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setIsConnecting(false);
    }
  }, [isConnecting, data.masterFactoryAddress]);

  const refreshIrysBalance = async (uploader) => {
    if (!uploader) {
      debug.warn('No Irys uploader instance available');
      return;
    }
    try {
      await prepareIrysNetwork();
      debug.log('Fetching Irys balance');
      const balance = await checkBalance(uploader);
      debug.info('Raw Irys balance:', balance);
      
      const formattedBalance = ethers.formatUnits(
        ethers.getBigInt(balance), 
        18
      );
      debug.info('Formatted Irys balance:', formattedBalance);
      setIrysBalance(`${formattedBalance} ETH`);
    } catch (error) {
      debug.error("Irys balance refresh failed:", error);
      setIrysBalance('0.00 ETH');
    } finally {
      // Switch back to Hoodi after operation
      await switchNetwork(NETWORKS.HOODI);
    }
  };

  const fundIrys = async (amount = "0.01") => {
    if (!data.irysUploader) {
      debug.warn('No Irys uploader available for funding');
      return;
    }
    try {
      debug.log(`Funding Irys with ${amount} ETH`);
      setLoading(true);
      setError(null);
      
      const networkReady = await prepareIrysNetwork();
      if (!networkReady) {
        throw new Error('Failed to switch to Sepolia network');
      }

      await fundAccount(data.irysUploader, amount);
      debug.info('Funding successful');
      
      await refreshIrysBalance(data.irysUploader);
    } catch (error) {
      debug.error("Funding failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      // Switch back to Hoodi after operation
      await switchNetwork(NETWORKS.HOODI);
    }
  };

  const withdrawIrys = async () => {
    if (!data.irysUploader) {
      debug.warn('No Irys uploader available for withdrawal');
      return;
    }
    try {
      debug.log('Starting Irys withdrawal process');
      setLoading(true);
      setError(null);

      const networkReady = await prepareIrysNetwork();
      if (!networkReady) {
        throw new Error('Failed to switch to Sepolia network');
      }

      const tx = await withdrawAccount(data.irysUploader);
      if (!tx) {
        throw new Error('Withdrawal failed');
      }
      debug.info('Withdrawal successful', tx);
      
      await refreshIrysBalance(data.irysUploader);
    } catch (error) {
      debug.error("Withdrawal failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      // Switch back to Hoodi after operation
      await switchNetwork(NETWORKS.HOODI);
    }
  };

  const handleAccountsChanged = useCallback(() => {
    if (!isConnecting) {
      connectWallet();
    }
  }, [connectWallet]);

  const refreshWalletInfo = useCallback(async () => {
    if (walletInfo.isConnected && data.ethProvider && data.sepoliaProvider && walletInfo.address) {
      await updateBalances(data.ethProvider, data.sepoliaProvider, walletInfo.address);
      if (data.irysUploader) {
        await refreshIrysBalance(data.irysUploader);
      }
    }
  }, [walletInfo.isConnected, data.ethProvider, data.sepoliaProvider, walletInfo.address, data.irysUploader]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [handleAccountsChanged]);

  return (
    <WalletContext.Provider value={{ 
      connectWallet,
      walletInfo,
      irysBalance,
      loading,
      error,
      fundIrys,
      withdrawIrys,
      refreshWalletInfo,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export { WalletProvider };
export default WalletProvider;