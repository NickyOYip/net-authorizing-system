import React from "react";
import { connectWallet, listenForWalletChanges } from "../utils/wallet";

const WalletConnect = ({ setWalletAddress }) => {
    const handleConnect = async () => {
        const address = await connectWallet();
        if (address) {
            setWalletAddress(address);
        }
    };

    return (
        <div>
            <button onClick={handleConnect}>Connect Wallet</button>
        </div>
    );
};

export default WalletConnect;
