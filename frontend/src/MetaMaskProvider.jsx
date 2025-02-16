/**
 * @title MetaMask Provider
 * @notice Provides MetaMask connection and state management
 */

import { createContext, useEffect, useContext } from 'react';
import { ethers, BrowserProvider } from 'ethers';
import { DataContext } from './store/dataStore.jsx'; // Corrected import path
import { registerUser, findUserContract, findOrDeployUserContract } from './services/userService.js'; // Import functions

const MetaMaskContextLocal = createContext();

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
        const provider = new BrowserProvider(window.ethereum);
        const networkInfo = await provider.getNetwork();
        
        // Retrieve target chain details from the datastore
        const targetChain = data.networkOptions[data.forcedNetwork];
        const targetChainId = parseInt(targetChain.chainId, 16);
        if (networkInfo.chainId !== targetChainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: targetChain.chainId }]
            });
          } catch (error) {
            if (error.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: targetChain.chainId,
                  chainName: targetChain.chainName,
                  rpcUrls: targetChain.rpcUrls,
                  blockExplorerUrls: targetChain.blockExplorerUrls,
                  nativeCurrency: targetChain.nativeCurrency
                }]
              });
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChain.chainId }]
              });
            } else {
              throw error;
            }
          }
          updateData('network', targetChain.chainName);
        } else {
          updateData('network', networkInfo.name);
        }

        // Find or deploy the user contract after connecting to MetaMask
        const userContractAddress = await findOrDeployUserContract(provider, data.factoryAddress, accounts[0]);
        updateData('userContractAddress', userContractAddress);
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
        console.error('Error during user registration:', error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this app.');
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        updateData('account', accounts[0] || null);
        if (accounts[0]) {
          const provider = new BrowserProvider(window.ethereum);
          const userContractAddress = await findOrDeployUserContract(provider, data.factoryAddress, accounts[0]);
          updateData('userContractAddress', userContractAddress);
        } else {
          updateData('userContractAddress', null);
        }
      });

      window.ethereum.on('chainChanged', async () => {
        // Use BrowserProvider instead of ethers.providers.Web3Provider
        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();

        // Retrieve target chain details from the datastore
        const targetChain = data.networkOptions[data.forcedNetwork];
        const targetChainId = parseInt(targetChain.chainId, 16);
        if (network.chainId !== targetChainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: targetChain.chainId }]
            });
          } catch (error) {
            if (error.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: targetChain.chainId,
                  chainName: targetChain.chainName,
                  rpcUrls: targetChain.rpcUrls,
                  blockExplorerUrls: targetChain.blockExplorerUrls,
                  nativeCurrency: targetChain.nativeCurrency
                }]
              });
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChain.chainId }]
              });
            } else {
              console.error('Failed to switch network', error);
              return;
            }
          }
          updateData('network', targetChain.chainName);
        } else {
          updateData('network', network.name);
        }
      });
    }
  }, [updateData, data.networkOptions, data.forcedNetwork]);

  return (
    <MetaMaskContextLocal.Provider value={{ connect, account: data.account, network: data.network }}>
      {children}
    </MetaMaskContextLocal.Provider>
  );
};

export { MetaMaskContextLocal as MetaMaskContext };
export default MetaMaskProvider;
