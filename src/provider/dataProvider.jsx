import { createContext, useState } from 'react';
/**
 * @title DataContext
 * @notice Provides a context for the data store
 */
export const DataContext = createContext();

const DataProvider = ({ children }) => {
  // Initialize the global state
  const [data, setData] = useState({
    //wallet instances for different networks
    ethProvider: null,     // Provider for Hoodi network (primary)
    sepoliaProvider: null, // Provider for Sepolia network (for Irys)
    irysUploader: null,    // Irys uploader instance (on Sepolia)

    //network setting
    masterFactoryAddress: '0xE4022C96C857E41689ffF2A8e259ac6647e16795',
    broadcastFactory:{// ftech from master factory
      version: null,
      address: null,
    },
    publicFactory:{
      version: null,
      address: null,
    },
    privateFactory:{
      version: null,
      address: null,
    },

    // Add other global state variables here
  });

  /**
   * @notice Updates the global state
   * @param {Object} newData - New data to update the context with.
   * @dev This function is used to update global data like account, network, etc.
   */
  const updateData = (newData) => {
    setData((prevData) => ({ ...prevData, ...newData }));
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

export { DataProvider };
export default DataProvider;
