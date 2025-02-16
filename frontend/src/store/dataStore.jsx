import { createContext, useState } from 'react';
import { UserProfile, Certificate } from './models/dataModels.js';

/**
 * @title DataContext
 * @notice Provides a context for the data store
 */
export const DataContext = createContext();

const DataProvider = ({ children }) => {
  // Initialize the global state
  const [data, setData] = useState({
    account: null,
    network: null,
    userContractAddress: null, // Add this line
    userProfile: new UserProfile({ owner: '', certificatesList: [], certifiedCertificates: [], history: [] }),
    factoryAddress: '0x5a2a8D8Af8F4a11faf997B2d5C9671A41F534f35',

    forcedNetwork: 'localGanache',// Change to 'ethereumMainnet' or 'arbitrumOne' or 'arbitrumRinkeby' or 'localGanache' for testing

    networkOptions: {
      ethereumMainnet: {
        chainId: '0x1', // 1 in hexadecimal
        chainName: 'Ethereum Mainnet',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'], // Replace with your Infura Project ID
        blockExplorerUrls: ['https://etherscan.io'],
      },
      arbitrumOne: {
        chainId: '0xa4b1', // 42161 in hexadecimal
        chainName: 'Arbitrum One',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io'],
      },
      arbitrumRinkeby: {
        chainId: '0x66ee', // 421611 in hexadecimal
        chainName: 'Arbitrum Rinkeby Testnet',
        rpcUrls: ['https://rinkeby.arbitrum.io/rpc'],
        nativeCurrency: {
          name: 'Arbitrum Ether', // Updated name
          symbol: 'AETH',         // Updated symbol to differentiate from Ethereum's ETH
          decimals: 18,
        },
        blockExplorerUrls: ['https://rinkeby-explorer.arbitrum.io'],
      },
      localGanache: {
        chainId: '0x539', // 1337 in hexadecimal
        chainName: 'Local Ganache',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['http://127.0.0.1:7545'],
        blockExplorerUrls: [], // Typically, no block explorer for local development
      },
    },
    
    // Add other global state variables here
  });

  /**
   * @title updateData
   * @notice Function to update the global state
   * @param {string} key - The key of the state variable to update
   * @param {any} value - The new value for the state variable
   */
  const updateData = (key, value) => {
    setData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  return (
    /**
     * @title DataContext.Provider
     * @notice Provides the global state and update function to the children components
     */
    <DataContext.Provider value={{ data, updateData }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
