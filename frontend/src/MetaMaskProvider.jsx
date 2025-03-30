import React, { useEffect } from "react";
import { useGlobalState } from "./store/globalState";

const MetaMaskProvider = ({ children }) => {
  const { setWalletConnected, setIsNetworkRight } = useGlobalState();

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then(accounts => {
        setWalletConnected(accounts.length > 0);
      });

      window.ethereum.on("chainChanged", () => {
        // Validate network ID here
        setIsNetworkRight(true); // Modify this logic as needed
      });
    }
  }, []);

  return <>{children}</>;
};

export default MetaMaskProvider;
