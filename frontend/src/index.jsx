import React from "react";
import ReactDOM from "react-dom";
import { GlobalStateProvider, useGlobalState } from "./store/globalState";
import App from "./App";
import LoginPage from "./components/LoginPage";

const Root = () => {
  const { walletConnected, isNetworkRight } = useGlobalState();

  return walletConnected && isNetworkRight ? <App /> : <LoginPage />;
};

ReactDOM.render(
  <GlobalStateProvider>
    <Root />
  </GlobalStateProvider>,
  document.getElementById("root")
);
