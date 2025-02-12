import React, { useState, useEffect } from "react";
import { connectWallet, listenForWalletChanges } from "../utils/wallet";

const WalletConnect = () => {
    const [walletAddress, setWalletAddress] = useState(null);

    useEffect(() => {
        listenForWalletChanges(setWalletAddress);
    }, []);

    const handleConnect = async () => {
        const address = await connectWallet();
        setWalletAddress(address);
    };

    return (
        <div className="wallet-container">
            {walletAddress ? (
                <p>Connected: {walletAddress}</p>
            ) : (
                <button onClick={handleConnect}>Connect Wallet</button>
            )}
        </div>
    );
};

export default WalletConnect;
