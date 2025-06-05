import { usePublicContract, usePublicSubContract, usePrivateContract, usePrivateSubContract } from '../hooks/contractHook';
import { DataContext } from '../provider/dataProvider';
import { useContext, useState } from 'react';
import { getCachedContractType } from '../utils/contractUtils';
import * as irysAction from '../hooks/irysHook/irysAction';
import { NETWORKS, switchNetwork } from '../utils/networkUtils';
import { encryptFile } from '../utils/encryptionUtils';


// Progress state type

export function useActivateService() {
  const publicContract = usePublicContract();
  const publicSub = usePublicSubContract();
  const privateContract = usePrivateContract();
  const privateSub = usePrivateSubContract();
  const { data } = useContext(DataContext);

  // Detect contract type based on address
  const detectContractType = async (contractAddress) => {
    if (!contractAddress) throw new Error('Contract address is required');
    
    try {
      const factories = {
        broadcast: data.broadcastFactory.address,
        public: data.publicFactory.address,
        private: data.privateFactory.address
      };
      
      return await getCachedContractType(contractAddress, factories, data.ethProvider);
    } catch (error) {
      console.error("[activateService] Error detecting contract type:", error);
      throw new Error('Could not determine contract type');
    }
  };

  // Helper method to prepare network for Irys upload
  const prepareIrysNetwork = async () => {
    try {
      console.log('[activateService] 🔄 Preparing network for Irys operation');
      await switchNetwork(NETWORKS.SEPOLIA);
      return true;
    } catch (error) {
      console.error('[activateService] ❌ Failed to prepare network for Irys:', error);
      return false;
    }
  };

  // Helper method to perform Irys operations with network switching
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

  // Upload files to Irys
  const uploadFilesToIrys = async (documentFile, jsonFile) => {
    try {
      let irys = data.irysUploader;
      if (!irys) {
        throw new Error('Irys instance not available in context');
      }

      let documentTxId, jsonTxId;
      
      await performIrysOperation(async () => {
        // Get user's address for encryption
        const signer = await data.ethProvider.getSigner();
        const userAddress = await signer.getAddress();
        
        // Step 1: Encrypt the files with MetaMask
        console.log('[activateService] 🔒 Encrypting document file...');
        const encryptedDocumentFile = await encryptFile(documentFile, userAddress);
        
        console.log('[activateService] 🔒 Encrypting JSON file...');
        const encryptedJsonFile = await encryptFile(jsonFile, userAddress);
        
        // Step 2: Upload the encrypted files to Irys
        console.log('[activateService] 📤 Uploading encrypted document to Irys');
        const documentReceipt = await irysAction.uploadData(irys, encryptedDocumentFile);
        documentTxId = documentReceipt.id;
        console.log('[activateService] ✅ Encrypted document uploaded:', documentTxId);
        
        console.log('[activateService] 📤 Uploading encrypted JSON metadata to Irys');
        const jsonReceipt = await irysAction.uploadData(irys, encryptedJsonFile);
        jsonTxId = jsonReceipt.id;
        console.log('[activateService] ✅ Encrypted JSON metadata uploaded:', jsonTxId);
      });

      return { documentTxId, jsonTxId };
    } catch (error) {
      console.error('[activateService] ❌ Error uploading encrypted files:', error);
      throw new Error(`Encrypted file upload failed: ${(error ).message}`);
    }
  };

  // Unified activation method for all contract types
  const activateContract = async (params) => {
    const { 
      contractAddress, 
      activationCode, 
      documentFile, 
      jsonFile, 
      documentHash, 
      jsonHash, 
      progressCallback 
    } = params;
    
    console.log('[activateService] ▶️ activateContract() called with:', { 
      contractAddress, 
      hasActivationCode: !!activationCode,
      hasDocumentFile: !!documentFile,
      hasJsonFile: !!jsonFile
    });

    try {
      // Step 1: Detect contract type
      console.log('[activateService] 🔍 Detecting contract type...');
      const contractType = await detectContractType(contractAddress);
      console.log(`[activateService] ✅ Contract type detected: ${contractType}`);
      
      // Update progress
      progressCallback({
        verifying: true,
        activating: null,
        uploading: null,
        encrypting: null,
        success: null
      });

      // Handle activation based on contract type
      switch (contractType) {
        case 'broadcast':
          // Broadcast contracts don't need activation
          console.log('[activateService] ℹ️ Broadcast contracts do not require activation');
          
          progressCallback({
            verifying: false,
            activating: false,
            uploading: false,
            encrypting: false,
            success: false
          });
          
          return {
            success: false,
            contractType,
            errorMessage: 'Broadcast contracts do not require activation'
          };

        case 'public':
          // For public contracts, just need activation code
          try {
            console.log('[activateService] 🔐 Activating public contract...');
            
            // Update progress - activating
            progressCallback({
              verifying: false,
              activating: true,
              uploading: null,
              encrypting: null,
              success: null
            });
            
            // Call the actual activation method
            const tx = await publicContract.activate(contractAddress, activationCode);
            console.log('[activateService] ✅ Public contract activated successfully:', tx.hash);
            
            // Update progress - success
            progressCallback({
              verifying: false,
              activating: false,
              uploading: false,
              encrypting: false,
              success: true
            });
            
            return {
              success: true,
              contractType,
              contractAddress,
              txHash: tx.hash
            };
          } catch (error) {
            console.error('[activateService] ❌ Public contract activation failed:', error);
            
            // Update progress - failed
            progressCallback({
              verifying: false,
              activating: false,
              uploading: false,
              encrypting: false,
              success: false
            });
            
            return {
              success: false,
              contractType,
              errorMessage: `Activation failed: ${(error ).message}`
            };
          }

        case 'private':
          // For private contracts:
          // 1. Verify file hashes (required)
          // 2. Activate with code
          // 3. Encrypt and upload files to Irys
          // 4. Update data links on the contract
          
          try {
            // Require files for private contract activation
            if (!documentFile || !jsonFile || !documentHash || !jsonHash) {
              throw new Error('Document and metadata files are required for private contract activation');
            }
            
            // Step 1: Find the active sub-contract address for verification
            console.log('[activateService] 🔍 Finding active sub-contract...');
            const mainContractDetails = await privateContract.getContractDetails(contractAddress);
            
            if (!mainContractDetails || !mainContractDetails.activeVer) {
              throw new Error('Invalid contract or no active version found');
            }
            
            const versionAddresses = await privateContract.getAllVersions(contractAddress);
            
            if (!versionAddresses || versionAddresses.length === 0) {
              throw new Error('No contract versions found');
            }
            
            const activeVer = mainContractDetails.activeVer;
            if (activeVer <= 0 || activeVer > versionAddresses.length) {
              throw new Error(`Invalid active version: ${activeVer}`);
            }
            
            const activeSubContractAddress = versionAddresses[activeVer - 1];
            console.log(`[activateService] ✅ Found active sub-contract: ${activeSubContractAddress}`);
            
            // Step 2: Verify file hashes match those stored on-chain
            console.log('[activateService] 🔍 Verifying file hashes...');
            const verified = await privateSub.verifyFileHash(activeSubContractAddress, documentHash, jsonHash);
            
            if (!verified) {
              console.error('[activateService] ❌ File hash verification failed');
              throw new Error('The provided files do not match the hashes recorded on the blockchain');
            }
            
            console.log('[activateService] ✅ File hashes verified successfully');
            
            // Step 3: Activate the contract
            console.log('[activateService] 🔐 Activating private contract...');
            
            // Update progress - activating
            progressCallback({
              verifying: false,
              activating: true,
              uploading: null,
              encrypting: null,
              success: null
            });
            
            // Call the actual activation method
            const activateTx = await privateContract.activate(contractAddress, activationCode);
            console.log('[activateService] ✅ Private contract activated successfully:', activateTx.hash);
            
            // Step 4: Encrypt and upload files to Irys
            console.log('[activateService] 🔒 Encrypting and uploading files...');
            
            // Update progress - encrypting
            progressCallback({
              verifying: false,
              activating: false,
              uploading: null,
              encrypting: true,
              success: null
            });
            
            // Perform the actual encryption and upload
            const { documentTxId, jsonTxId } = await uploadFilesToIrys(documentFile, jsonFile);
            
            // Update progress - uploading
            progressCallback({
              verifying: false,
              activating: false,
              uploading: true,
              encrypting: false,
              success: null
            });
            
            // Step 5: Update data links on the contract
            console.log('[activateService] 📝 Updating data links on contract...');
            const updateTx = await privateSub.updateDataLinks(activeSubContractAddress, {
              jsonLink: jsonTxId,
              softCopyLink: documentTxId
            });
            
            console.log('[activateService] ✅ Data links updated successfully:', updateTx.transactionHash);
            
            // Update progress - success
            progressCallback({
              verifying: false,
              activating: false,
              uploading: false,
              encrypting: false,
              success: true
            });
            
            return {
              success: true,
              contractType,
              contractAddress,
              txHash: activateTx.hash,
              txIds: {
                document: documentTxId,
                json: jsonTxId
              }
            };
          } catch (error) {
            console.error('[activateService] ❌ Private contract activation failed:', error);
            
            // Update progress - failed
            progressCallback({
              verifying: false,
              activating: false,
              uploading: false,
              encrypting: false,
              success: false
            });
            
            return {
              success: false,
              contractType,
              errorMessage: `Activation failed: ${(error ).message}`
            };
          }

        default:
          console.error('[activateService] ❌ Unknown contract type:', contractType);
          
          progressCallback({
            verifying: false,
            activating: false,
            uploading: false,
            encrypting: false,
            success: false
          });
          
          return {
            success: false,
            contractType: 'unknown',
            errorMessage: 'Unknown or invalid contract type'
          };
      }
    } catch (error) {
      console.error('[activateService] ❌ Activation error:', error);
      
      progressCallback({
        verifying: false,
        activating: false,
        uploading: false,
        encrypting: false,
        success: false
      });
      
      return {
        success: false,
        errorMessage: `Activation process failed: ${(error ).message}`
      };
    }
  };

  return {
    // Original methods
    activatePublic: publicContract.activate,
    setPublicUser: publicSub.setUser,
    verifyPublicFile: publicSub.verifyFileHash,
    activatePrivate: privateContract.activate,
    setPrivateUser: privateSub.setUser,
    verifyPrivateFile: privateSub.verifyFileHash,
    updatePrivateDataLinks: privateSub.updateDataLinks,
    
    // New unified methods
    detectContractType,
    activateContract
  };
}
