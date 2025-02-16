/**
 * @title MetaMask Provider
 * @notice Provides MetaMask connection and state management
 */

import { createContext, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { DataContext } from './store/dataStore.jsx'; // Corrected import path

export const MetaMaskContext = createContext();

/**
 * @title MetaMaskProvider
 * @notice Provides MetaMask context to its children
 * @param {object} children - The child components that will consume the context
 */
const MetaMaskProvider = ({ children }) => {
  const { data, updateData } = useContext(DataContext);

  /**
   * @notice Connects to MetaMask and updates the account and network in the data store
   */
  const connect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        updateData('account', accounts[0]);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        updateData('network', network.name);
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      window.open('https://metamask.io/download.html', '_blank');
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        updateData('account', accounts[0] || null);
      });

      window.ethereum.on('chainChanged', async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        updateData('network', network.name);
      });
    }
  }, [updateData]);

  return (
    <MetaMaskContext.Provider value={{ connect, account: data.account, network: data.network }}>
      {children}
    </MetaMaskContext.Provider>
  );
};

export default MetaMaskProvider;
