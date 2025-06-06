import { ethers } from 'ethers';
import * as irysAction from '../hooks/irysHook/irysAction';
import { NETWORKS, switchNetwork } from '../utils/networkUtils';


// Helper function to generate file hash (moved from useFileVerification hook)
const generateFileHash = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const prepareIrysNetwork = async () => {
  try {
    console.log('Preparing network for Irys operation');
    await switchNetwork(NETWORKS.SEPOLIA);
    return true;
  } catch (error) {
    console.error('Failed to prepare network for Irys:', error);
    return false;
  }
};

const performIrysOperation = async (operation) => {
  try {
    const networkReady = await prepareIrysNetwork();
    if (!networkReady) {
      throw new Error('Failed to switch to Sepolia network');
    }
    
    const result = await operation();
    
    // Switch back to Hoodi after operation
    await switchNetwork(NETWORKS.HOODI);
    return result;
  } catch (error) {
    // Switch back to Hoodi even if operation fails
    await switchNetwork(NETWORKS.HOODI);
    throw error;
  }
};

/**
 * Service for contract creation
 */
export const createService = {
  /**
   * Create a broadcast contract
   */
  createBroadcastContract: async (params) => {
    const provider = window.ethereum;
    if (!provider) {
      throw new Error('No Ethereum provider available');
    }

    try {
      // Update progress - Estimating
      params.progressCallback({
        estimating: true,
        uploading: null,
        creating: null,
        success: null
      });

      // Generate file hashes
      const documentHash = await generateFileHash(params.documentFile);
      const jsonHash = await generateFileHash(params.jsonFile);

      // Use the provided Irys instance instead of creating a new one
      let irys = params.irysUploader;
      if (!irys) {
        throw new Error('Irys instance not available in context');
      }

      params.progressCallback({
        estimating: false,
        uploading: true,
        creating: null,
        success: null
      });

      // Upload files with network switching
      let documentTxId, jsonTxId;
      try {
        await performIrysOperation(async () => {
          // Upload document
          const documentReceipt = await irysAction.uploadData(irys, params.documentFile);
          documentTxId = documentReceipt.id;
          
          // Upload JSON
          const jsonReceipt = await irysAction.uploadData(irys, params.jsonFile);
          jsonTxId = jsonReceipt.id;
        });
      } catch (err) {
        console.error("File upload failed:", err);
        throw new Error(`File upload failed: ${(err).message}`);
      }

      params.progressCallback({
        estimating: false,
        uploading: false,
        creating: true,
        success: null
      });

      // Get contract methods from params.contractHelpers
      const contractHelpers = params.contractHelpers;
      if (!contractHelpers) {
        throw new Error('Contract helpers not provided');
      }

      // Create the broadcast contract using the contract helpers
      const { createBroadcastContract, addNewBroadcastSubContract } = contractHelpers;
      
      console.log("Creating main broadcast contract with title:", params.title);
      const contractEvent = await createBroadcastContract(params.factoryAddress, {
        title: params.title
      });

      if (!contractEvent?.contractAddr) {
        throw new Error('Contract creation failed: No contract address returned');
      }
      
      console.log("Broadcast contract created:", contractEvent.contractAddr);

      // Create the sub-contract with document details
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const oneYearFromNow = currentTimestamp + 31536000; // 1 year in seconds

      console.log("Creating broadcast sub-contract with storage links:", `${jsonTxId},${documentTxId}`);
      const subContractEvent = await addNewBroadcastSubContract(contractEvent.contractAddr, {
        jsonHash,
        softCopyHash: documentHash,
        storageLink: `${jsonTxId},${documentTxId}`,
        startDate: currentTimestamp,
        endDate: oneYearFromNow
      });
      
      console.log("Broadcast sub-contract created:", subContractEvent?.subContractAddr);

      // Update to success state
      params.progressCallback({
        estimating: false,
        uploading: false,
        creating: false,
        success: true
      });

      return {
        success: true,
        contractAddress: contractEvent.contractAddr,
        subContractAddress: subContractEvent?.subContractAddr,
        transactionHash: subContractEvent?.transactionHash
      };
    } catch (error) {
      console.error('Error creating broadcast contract:', error);
      
      // Update to error state
      params.progressCallback({
        estimating: false,
        uploading: false,
        creating: false,
        success: false
      });
      
      return {
        success: false,
        errorMessage: (error).message || 'Unknown error occurred'
      };
    }
  },

  /**
   * Create a public contract
   */
  createPublicContract: async (params) => {
    const provider = window.ethereum;
    if (!provider) {
      throw new Error('No Ethereum provider available');
    }

    try {
      // Update progress - Estimating
      params.progressCallback({
        estimating: true,
        uploading: null,
        creating: null,
        success: null
      });

      // Generate file hashes
      const documentHash = await generateFileHash(params.documentFile);
      const jsonHash = await generateFileHash(params.jsonFile);

      // Use the provided Irys instance instead of creating a new one
      let irys = params.irysUploader;
      if (!irys) {
        throw new Error('Irys instance not available in context');
      }

      params.progressCallback({
        estimating: false,
        uploading: true,
        creating: null,
        success: null
      });

      // Upload files with network switching
      let documentTxId, jsonTxId;
      try {
        await performIrysOperation(async () => {
          // Upload document
          const documentReceipt = await irysAction.uploadData(irys, params.documentFile);
          documentTxId = documentReceipt.id;
          
          // Upload JSON
          const jsonReceipt = await irysAction.uploadData(irys, params.jsonFile);
          jsonTxId = jsonReceipt.id;
        });
      } catch (err) {
        console.error("File upload failed:", err);
        throw new Error(`File upload failed: ${(err ).message}`);
      }

      params.progressCallback({
        estimating: false,
        uploading: false,
        creating: true,
        success: null
      });

      // Get contract methods from params.contractHelpers
      const contractHelpers = params.contractHelpers;
      if (!contractHelpers) {
        throw new Error('Contract helpers not provided');
      }

      // Create the public contract using the contract helpers
      const { createPublicContract, addNewPublicSubContract } = contractHelpers;
      
      console.log("Creating main public contract with title:", params.title);
      const contractEvent = await createPublicContract(params.factoryAddress, {
        title: params.title,
        activationCode: params.activationCode
      });

      if (!contractEvent?.contractAddr) {
        throw new Error('Contract creation failed: No contract address returned');
      }
      
      console.log("Public contract created:", contractEvent.contractAddr);

      // Create the sub-contract with document details
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const oneYearFromNow = currentTimestamp + 31536000; // 1 year in seconds

      console.log("Creating public sub-contract with storage links:", `${jsonTxId},${documentTxId}`);
      const subContractEvent = await addNewPublicSubContract(contractEvent.contractAddr, {
        jsonHash,
        softCopyHash: documentHash,
        storageLink: `${jsonTxId},${documentTxId}`,
        startDate: currentTimestamp,
        endDate: oneYearFromNow
      });
      
      console.log("Public sub-contract created:", subContractEvent?.subContractAddr);

      // Update to success state
      params.progressCallback({
        estimating: false,
        uploading: false,
        creating: false,
        success: true
      });

      return {
        success: true,
        contractAddress: contractEvent.contractAddr,
        subContractAddress: subContractEvent?.subContractAddr,
        transactionHash: subContractEvent?.transactionHash
      };
    } catch (error) {
      console.error('Error creating public contract:', error);
      
      // Update to error state
      params.progressCallback({
        estimating: false,
        uploading: false,
        creating: false,
        success: false
      });
      
      return {
        success: false,
        errorMessage: (error).message || 'Unknown error occurred'
      };
    }
  },

  /**
   * Create a private contract
   */
  createPrivateContract: async (params) => {
    try {
      // Update progress - Estimating
      params.progressCallback({
        estimating: true,
        uploading: null,
        creating: null,
        success: null
      });

      // For private contracts, we only store hashes on-chain, not the actual files
      const documentHash = await generateFileHash(params.documentFile);
      const jsonHash = await generateFileHash(params.jsonFile);

      // Skip uploading step for private contracts - files will be shared offline
      params.progressCallback({
        estimating: false,
        uploading: false, // Skip uploading for private contracts
        creating: true,
        success: null
      });

      // Get contract methods from params.contractHelpers
      const contractHelpers = params.contractHelpers;
      if (!contractHelpers) {
        throw new Error('Contract helpers not provided');
      }

      // Create the private contract using the contract helpers
      const { createPrivateContract, addNewPrivateSubContract } = contractHelpers;

      console.log("Creating main private contract with title:", params.title);
      const contractEvent = await createPrivateContract(params.factoryAddress, {
        title: params.title,
        activationCode: params.activationCode
      });

      if (!contractEvent?.contractAddr) {
        throw new Error('Contract creation failed: No contract address returned');
      }
      
      console.log("Private contract created:", contractEvent.contractAddr);

      // Create the sub-contract with document hashes only (no storage links)
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const oneYearFromNow = currentTimestamp + 31536000; // 1 year in seconds

      console.log("Creating private sub-contract");
      const subContractEvent = await addNewPrivateSubContract(contractEvent.contractAddr, {
        jsonHash,
        softCopyHash: documentHash,
        startDate: currentTimestamp,
        endDate: oneYearFromNow
      });
      
      console.log("Private sub-contract created:", subContractEvent?.subContractAddr);

      // Update to success state
      params.progressCallback({
        estimating: false,
        uploading: false,
        creating: false,
        success: true
      });

      return {
        success: true,
        contractAddress: contractEvent.contractAddr,
        subContractAddress: subContractEvent?.subContractAddr,
        transactionHash: subContractEvent?.transactionHash
      };
    } catch (error) {
      console.error('Error creating private contract:', error);
      
      // Update to error state
      params.progressCallback({
        estimating: false,
        uploading: false,
        creating: false,
        success: false
      });
      
      return {
        success: false,
        errorMessage: (error).message || 'Unknown error occurred'
      };
    }
  }
};
