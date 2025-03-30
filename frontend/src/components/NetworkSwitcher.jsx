import React from "react";
import { useGlobalState } from "../store/globalState";

const NetworkSwitcher = ({ onClose }) => {
  const { setIsNetworkRight } = useGlobalState();

  const switchNetwork = () => {
    setIsNetworkRight(true);
    onClose(); // Close modal after switching network
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Change Network</h3>
        <button onClick={switchNetwork}>Switch to Correct Network</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default NetworkSwitcher;
