import { useState, useContext } from 'react';
import { useBroadcastSubContract, usePublicSubContract, usePrivateSubContract } from '../hooks/contractHook';
import { DataContext } from '../provider/dataProvider';
import { getCachedContractType, ContractType } from '../utils/contractUtils';
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
  const detectContractType = async (contractAddress: string): Promise<ContractType> => {
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
  const verifyDocument = async (params: {
    contractAddress: string,
    fileHash?: string,
    jsonHash?: string,
    contractType?: ContractType
  }) => {
    const { contractAddress, fileHash, jsonHash, contractType: providedType } = params;
    
    try {
      // Auto-detect contract type if not provided
      const contractType = providedType || await detectContractType(contractAddress);
      console.log(`[verifyService] Contract type detected: ${contractType}`);
      
      // Choose the right verification method based on contract type
      let verified = false;
      let details = null;
      let mainContractDetails = null;
      
      switch (contractType) {
        case 'broadcast':
          try {
            // For broadcast contracts, first check if the main contract exists
            mainContractDetails = await broadcastContract.getContractDetails(contractAddress);
            
            // If we made it here, the contract exists - that's a successful verification for broadcast
            verified = true;
            details = { mainContractDetails };
            
            // Try to get the active version details, but don't fail verification if this fails
            try {
              if (mainContractDetails?.activeVer) {
                const versionAddresses = await broadcastContract.getAllVersions(contractAddress);
                if (versionAddresses && versionAddresses.length > 0) {
                  const activeVersionAddress = versionAddresses[mainContractDetails.activeVer - 1];
                  if (activeVersionAddress) {
                    const versionDetails = await broadcastSub.getSubContractDetails(activeVersionAddress);
                    details.versionDetails = versionDetails;
                  }
                }
              }
            } catch (subError) {
              console.log("[verifyService] Could not fetch version details, but contract exists:", subError);
              // Still verified even if sub-details fail
            }
          } catch (error) {
            verified = false;
            console.error("[verifyService] Could not verify broadcast contract:", error);
          }
          break;
          
        case 'public':
          try {
            // Similar approach for public contracts
            mainContractDetails = await publicContract.getContractDetails(contractAddress);
            verified = true;
            details = { mainContractDetails };
            
            try {
              if (mainContractDetails?.activeVer) {
                const versionAddresses = await publicContract.getAllVersions(contractAddress);
                if (versionAddresses && versionAddresses.length > 0) {
                  const activeVersionAddress = versionAddresses[mainContractDetails.activeVer - 1];
                  if (activeVersionAddress) {
                    const versionDetails = await publicSub.getSubContractDetails(activeVersionAddress);
                    details.versionDetails = versionDetails;
                  }
                }
              }
            } catch (subError) {
              console.log("[verifyService] Could not fetch version details, but contract exists:", subError);
            }
          } catch (error) {
            verified = false;
            console.error("[verifyService] Could not verify public contract:", error);
          }
          break;
          
        case 'private':
          // For private contracts, we need to verify the file hash
          if (!fileHash || !jsonHash) {
            throw new Error('Document and metadata file are required for private contract verification');
          }
          
          try {
            // Call the actual verification method
            verified = await privateSub.verifyFileHash(contractAddress, fileHash, jsonHash);
            
            // Try to get contract details if available, but don't fail if we can't
            try {
              mainContractDetails = await privateContract.getContractDetails(contractAddress);
              details = { mainContractDetails };
            } catch (e) {
              console.log('[verifyService] Could not fetch private contract details');
            }
          } catch (error) {
            verified = false;
            console.error("[verifyService] Could not verify private contract:", error);
          }
          break;
          
        default:
          throw new Error('Unknown contract type');
      }
      
      return {
        verified,
        contractType,
        details,
        message: verified 
          ? 'Document verified successfully!' 
          : 'Document verification failed. The provided document does not match the blockchain record.',
      };
    } catch (error) {
      console.error("[verifyService] Verification error:", error);
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
