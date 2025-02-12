import { ethers } from "ethers";

export async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask is not installed. Please install it to use this app./n https://metamask.io/");
        console.error("❌ MetaMask not found.");
        return null;
    }

    try {
        console.log("⏳ Requesting wallet connection...");
        
        // Fix: Use 'BrowserProvider' instead of 'Web3Provider'
        const provider = new ethers.BrowserProvider(window.ethereum);
        console.log("✅ Provider created:", provider);

        const signer = await provider.getSigner();
        console.log("✅ Signer retrieved:", signer);

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("✅ Accounts retrieved:", accounts);

        return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
        console.error("❌ Wallet connection failed:", error);
        alert("Wallet connection failed. Check the console for details.");
        return null;
    }
}

export function listenForWalletChanges(setWalletAddress) {
    if (!window.ethereum) return;

    window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
            console.log("🔄 Wallet changed:", accounts[0]);
            setWalletAddress(accounts[0]);
        } else {
            console.log("🚪 Wallet disconnected");
            setWalletAddress(null);
        }
    });
}
