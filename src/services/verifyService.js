import { useState, useContext } from 'react';
import { useBroadcastSubContract, usePublicSubContract, usePrivateSubContract } from '../hooks/contractHook';
import { DataContext } from '../provider/dataProvider';
import { getCachedContractType } from '../utils/contractUtils';
import { useBroadcastContract, usePublicContract, usePrivateContract } from '../hooks/contractHook';

export function useVerifyService() {
  const broadcastSub = useBroadcastSubContract();
  const publicSub = usePublicSubContract();
  const privateSub = usePrivateSubContract();
  
  // Add main contracts to get the parent contract details first
  const broadcastContract = useBroadcastContract();
  const publicContract = usePublicContract();
  const privateContract = usePrivateContract();
  
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
      console.error("[verifyService] Error detecting contract type:", error);
      throw new Error('Could not determine contract type');
    }
  };

  // Unified verification function that works for all contract types
  const verifyDocument = async (params) => {
    const { contractAddress, fileHash, jsonHash, contractType: providedType } = params;
    
    console.log('[verifyService] ▶️ verifyDocument() called with:', { 
      contractAddress, 
      fileHash: fileHash ? `${fileHash.substring(0, 10)}...` : undefined,
      jsonHash: jsonHash ? `${jsonHash.substring(0, 10)}...` : undefined,
      contractType: providedType 
    });
    
    try {
      // Auto-detect contract type if not provided
      console.log('[verifyService] 🔍 Detecting contract type...');
      const contractType = providedType || await detectContractType(contractAddress);
      console.log(`[verifyService] ✅ Contract type detected: ${contractType}`);
      
      // Choose the right verification method based on contract type
      let verified = false;
      let details = null;
      let mainContractDetails = null;
      let activeSubContractAddress = null;
      
      switch (contractType) {
        case 'broadcast':
          console.log('[verifyService] 🔄 Verifying BROADCAST contract...');
          try {
            // Get the main contract details first
            console.log('[verifyService] 🔍 Fetching main contract details...');
            mainContractDetails = await broadcastContract.getContractDetails(contractAddress);
            console.log('[verifyService] ✅ Main contract details retrieved:', { 
              title: mainContractDetails?.title,
              activeVer: mainContractDetails?.activeVer
            });
            
            details = { mainContractDetails };
            
            // Find the active sub-contract address
            if (mainContractDetails?.activeVer > 0) {
              console.log('[verifyService] 🔍 Fetching version addresses...');
              const versionAddresses = await broadcastContract.getAllVersions(contractAddress);
              console.log('[verifyService] ✅ Version addresses retrieved:', { 
                count: versionAddresses.length, 
                addresses: versionAddresses
              });
              
              if (versionAddresses && versionAddresses.length > 0) {
                const activeVer = mainContractDetails.activeVer;
                // Check if the active version index is valid
                if (activeVer > 0 && activeVer <= versionAddresses.length) {
                  // Arrays are 0-indexed but versions start at 1
                  activeSubContractAddress = versionAddresses[activeVer - 1]; 
                  console.log(`[verifyService] 🔍 Active version ${activeVer} address: ${activeSubContractAddress}`);
                  
                  // Try to get sub-contract details to verify it exists
                  try {
                    console.log('[verifyService] 🔍 Fetching sub-contract details...');
                    const versionDetails = await broadcastSub.getSubContractDetails(activeSubContractAddress);
                    console.log('[verifyService] ✅ Sub-contract details retrieved:', {
                      version: versionDetails.version,
                      deployTime: versionDetails.deployTime
                    });
                    details.versionDetails = versionDetails;
                    verified = true;
                  } catch (subError) {
                    console.error('[verifyService] ❌ Failed to get sub-contract details:', subError);
                    verified = false;
                  }
                } else {
                  console.error(`[verifyService] ❌ Invalid active version: ${activeVer} (total versions: ${versionAddresses.length})`);
                  verified = false;
                }
              } else {
                console.error('[verifyService] ❌ No version addresses found');
                verified = false;
              }
            } else {
              console.error('[verifyService] ❌ No active version found');
              verified = false;
            }
          } catch (error) {
            verified = false;
            console.error("[verifyService] ❌ Could not verify broadcast contract:", error);
          }
          break;
          
        case 'public':
          console.log('[verifyService] 🔄 Verifying PUBLIC contract...');
          try {
            // Get the main contract details first
            console.log('[verifyService] 🔍 Fetching main contract details...');
            mainContractDetails = await publicContract.getContractDetails(contractAddress);
            console.log('[verifyService] ✅ Main contract details retrieved:', { 
              title: mainContractDetails?.title,
              activeVer: mainContractDetails?.activeVer
            });
            
            details = { mainContractDetails };
            
            // Find the active sub-contract address
            if (mainContractDetails?.activeVer > 0) {
              console.log('[verifyService] 🔍 Fetching version addresses...');
              const versionAddresses = await publicContract.getAllVersions(contractAddress);
              console.log('[verifyService] ✅ Version addresses retrieved:', { 
                count: versionAddresses.length, 
                addresses: versionAddresses
              });
              
              if (versionAddresses && versionAddresses.length > 0) {
                const activeVer = mainContractDetails.activeVer;
                // Check if the active version index is valid
                if (activeVer > 0 && activeVer <= versionAddresses.length) {
                  // Arrays are 0-indexed but versions start at 1
                  activeSubContractAddress = versionAddresses[activeVer - 1]; 
                  console.log(`[verifyService] 🔍 Active version ${activeVer} address: ${activeSubContractAddress}`);
                  
                  // Try to get sub-contract details to verify it exists
                  try {
                    console.log('[verifyService] 🔍 Fetching sub-contract details...');
                    const versionDetails = await publicSub.getSubContractDetails(activeSubContractAddress);
                    console.log('[verifyService] ✅ Sub-contract details retrieved:', {
                      version: versionDetails.version,
                      deployTime: versionDetails.deployTime
                    });
                    details.versionDetails = versionDetails;
                    verified = true;
                  } catch (subError) {
                    console.error('[verifyService] ❌ Failed to get sub-contract details:', subError);
                    verified = false;
                  }
                } else {
                  console.error(`[verifyService] ❌ Invalid active version: ${activeVer} (total versions: ${versionAddresses.length})`);
                  verified = false;
                }
              } else {
                console.error('[verifyService] ❌ No version addresses found');
                verified = false;
              }
            } else {
              console.error('[verifyService] ❌ No active version found');
              verified = false;
            }
          } catch (error) {
            verified = false;
            console.error("[verifyService] ❌ Could not verify public contract:", error);
          }
          break;
          
        case 'private':
          console.log('[verifyService] 🔄 Verifying PRIVATE contract...');
          // For private contracts, we need to verify the file hash
          if (!fileHash || !jsonHash) {
            console.error('[verifyService] ❌ Missing required files for private contract');
            throw new Error('Document and metadata file are required for private contract verification');
          }
          
          try {
            // Get the main contract details first
            console.log('[verifyService] 🔍 Fetching main contract details...');
            mainContractDetails = await privateContract.getContractDetails(contractAddress);
            console.log('[verifyService] ✅ Main contract details retrieved:', { 
              title: mainContractDetails?.title,
              activeVer: mainContractDetails?.activeVer
            });
            
            details = { mainContractDetails };
            
            // Find the active sub-contract address
            if (mainContractDetails?.activeVer > 0) {
              console.log('[verifyService] 🔍 Fetching version addresses...');
              const versionAddresses = await privateContract.getAllVersions(contractAddress);
              console.log('[verifyService] ✅ Version addresses retrieved:', { 
                count: versionAddresses.length, 
                addresses: versionAddresses
              });
              
              if (versionAddresses && versionAddresses.length > 0) {
                const activeVer = mainContractDetails.activeVer;
                // Check if the active version index is valid
                if (activeVer > 0 && activeVer <= versionAddresses.length) {
                  // Arrays are 0-indexed but versions start at 1
                  activeSubContractAddress = versionAddresses[activeVer - 1]; 
                  console.log(`[verifyService] 🔍 Active version ${activeVer} address: ${activeSubContractAddress}`);
                  
                  // For private contracts, verify file hashes against the active sub-contract
                  console.log('[verifyService] 🔍 Verifying file hashes against sub-contract...');
                  verified = await privateSub.verifyFileHash(activeSubContractAddress, fileHash, jsonHash);
                  console.log(`[verifyService] ${verified ? '✅ File verification SUCCEEDED' : '❌ File verification FAILED'}`);
                  
                  try {
                    console.log('[verifyService] 🔍 Fetching sub-contract details...');
                    const versionDetails = await privateSub.getSubContractDetails(activeSubContractAddress);
                    console.log('[verifyService] ✅ Sub-contract details retrieved');
                    details.versionDetails = versionDetails;
                  } catch (detailsError) {
                    console.log('[verifyService] ⚠️ Could not fetch sub-contract details but verification completed');
                  }
                } else {
                  console.error(`[verifyService] ❌ Invalid active version: ${activeVer} (total versions: ${versionAddresses.length})`);
                  verified = false;
                }
              } else {
                console.error('[verifyService] ❌ No version addresses found');
                verified = false;
              }
            } else {
              console.error('[verifyService] ❌ No active version found');
              verified = false;
            }
          } catch (error) {
            verified = false;
            console.error("[verifyService] ❌ Could not verify private contract:", error);
          }
          break;
          
        default:
          console.error('[verifyService] ❌ Unknown contract type:', contractType);
          throw new Error('Unknown contract type');
      }
      
      console.log(`[verifyService] 🏁 Verification completed: ${verified ? 'SUCCESS' : 'FAILURE'}`);
      return {
        verified,
        contractType,
        details,
        message: verified 
          ? 'Document verified successfully!' 
          : 'Document verification failed. The provided document does not match the blockchain record.',
      };
    } catch (error) {
      console.error("[verifyService] ❌ Verification error:", error);
      throw error;
    }
  };

  return {
    // Original methods
    verifyBroadcastFile: broadcastSub.verifyFileHash,
    verifyPublicFile: publicSub.verifyFileHash,
    verifyPrivateFile: privateSub.verifyFileHash,
    
    // New unified methods
    detectContractType,
    verifyDocument
  };
}
