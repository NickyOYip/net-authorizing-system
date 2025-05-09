import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useBroadcastSubContract, usePublicSubContract, usePrivateSubContract } from '..';

interface FileVerificationReturn {
  isLoading: boolean;
  error: string | null;
  
  // Verify file against any subcontract (auto-detects contract type)
  verifyFile: (
    subContractAddress: string,
    fileHash: string,
    fileType: 'json' | 'softCopy'
  ) => Promise<{
    isValid: boolean;
    contractType: 'broadcast' | 'public' | 'private';
  }>;
  
  // Generate hash for file (useful for pre-verification)
  generateFileHash: (file: File) => Promise<string>;
}

/**
 * Helper hook for verifying file hashes against any contract type
 */
export function useFileVerification(): FileVerificationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Import all contract hooks
  const broadcastSubContract = useBroadcastSubContract();
  const publicSubContract = usePublicSubContract();
  const privateSubContract = usePrivateSubContract();
  
  /**
   * Generate a hash for a file
   */
  const generateFileHash = useCallback(async (file: File): Promise<string> => {
    try {
      setIsLoading(true);
      
      // Read the file as ArrayBuffer
      const buffer = await file.arrayBuffer();
      
      // Create a hash of the file
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      
      // Convert the ArrayBuffer to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    } catch (err) {
      console.error('Error generating file hash:', err);
      setError(`Failed to generate hash: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Verify a file hash against any contract type
   */
  const verifyFile = useCallback(async (
    subContractAddress: string,
    fileHash: string,
    fileType: 'json' | 'softCopy'
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try each contract type, one will succeed if the address is valid
      try {
        const isValid = await broadcastSubContract.verifyFileHash(
          subContractAddress,
          fileHash,
          fileType
        );
        return { isValid, contractType: 'broadcast' as const };
      } catch (broadcastError) {
        // Try next type
      }
      
      try {
        const isValid = await publicSubContract.verifyFileHash(
          subContractAddress,
          fileHash,
          fileType
        );
        return { isValid, contractType: 'public' as const };
      } catch (publicError) {
        // Try next type
      }
      
      try {
        const isValid = await privateSubContract.verifyFileHash(
          subContractAddress,
          fileHash,
          fileType
        );
        return { isValid, contractType: 'private' as const };
      } catch (privateError) {
        // If we get here, none of the contract types worked
        throw new Error('Contract address is not a valid sub-contract');
      }
    } catch (err) {
      console.error('Error verifying file:', err);
      setError(`Failed to verify file: ${(err as Error).message}`);
      return { isValid: false, contractType: 'broadcast' as const };
    } finally {
      setIsLoading(false);
    }
  }, [broadcastSubContract, publicSubContract, privateSubContract]);
  
  return {
    isLoading,
    error,
    verifyFile,
    generateFileHash
  };
}
