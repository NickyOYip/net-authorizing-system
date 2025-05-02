import { createContext, useState } from 'react';
/**
 * @title DataContext
 * @notice Provides a context for the data store
 */
export const DataContext = createContext();



const DataProvider = ({ children }) => {
  // Initialize the global state
  const [data, setData] = useState({

    //wallet instance
    ethProvider: null, // ethers.BrowserProvider instance
    irysUploader: null, // Irys uploader instance

    //network setting
    masterFactoryAddress: '0xf008D8CFb6AA746DB2b2D46EB97Cf750a8f48Fb2',
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
