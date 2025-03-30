import { createContext, useContext, useState } from "react";

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [isNetworkRight, setIsNetworkRight] = useState(false);

  return (
    <GlobalStateContext.Provider value={{ 
      walletConnected, setWalletConnected, 
      isNetworkRight, setIsNetworkRight 
    }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);
