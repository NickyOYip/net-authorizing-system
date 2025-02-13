import React, { useState } from "react";
import WalletConnect from "./components/WalletConnect";
import Dashboard from "./components/Dashboard"; // Another component that needs the wallet address

const App = () => {
    const [walletAddress, setWalletAddress] = useState(null);

    return (
        <div>
            <h1>My Blockchain App</h1>
            <WalletConnect setWalletAddress={setWalletAddress} />
            <Dashboard walletAddress={walletAddress} />
        </div>
    );
};

export default App;
