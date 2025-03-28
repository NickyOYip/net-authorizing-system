import React, { useState } from "react";
import { useGlobalState } from "../store/globalState";
import NetworkSwitcher from "./NetworkSwitcher";

const LoginPage = () => {
  const { setWalletConnected, setIsNetworkRight } = useGlobalState();
  const [showNetworkSwitcher, setShowNetworkSwitcher] = useState(false);

  const handleLogin = () => {
    setWalletConnected(true);
  };

  return (
    <div className="login-container">
      <h2>Welcome, Please Log In</h2>
      <button onClick={handleLogin}>Connect Wallet</button>
      <button onClick={() => setShowNetworkSwitcher(true)}>Change Network</button>
      
      {showNetworkSwitcher && <NetworkSwitcher onClose={() => setShowNetworkSwitcher(false)} />}
    </div>
  );
};

export default LoginPage;
