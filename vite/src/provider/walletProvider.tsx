import { useState, useContext, createContext, useEffect } from "react";
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

  const connectWallet = async () => {
    console.log("start connect to ETH wallet");

    if (typeof window.ethereum === 'undefined') {
      console.error("No Ethereum provider found. Please install MetaMask or another wallet.");
      setWalletStatus("No Ethereum provider found. Please install MetaMask or another wallet.");
      return;
    }

    try {
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
    }
  };

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
      fetchFactoryInfo
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export { WalletProvider };
export default WalletProvider;