import { useState, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../../provider/dataProvider';
import { ContractStatus } from './types';

interface SubContractDetails {
  publicContractAddr: string;
  owner: string;
  status: ContractStatus;
  version: number;
  jsonHash: string;
  softCopyHash: string;
  storageLink: string;
  startDate: number;
  endDate: number;
  deployTime: number;
}

const PublicSubContractABI = [
  "function getDetail() view returns (address publicContractAddr, address owner, uint8 status, uint256 version, string jsonHash, string softCopyHash, string storageLink, uint256 startDate, uint256 endDate, uint256 deployTime)",
  "function updateStatus(uint8 newStatus)",
  "function publicContractAddr() view returns (address)",
  "function owner() view returns (address)",
  "function status() view returns (uint8)",
  "function version() view returns (uint256)",
  "function jsonHash() view returns (string)",
  "function softCopyHash() view returns (string)",
  "function storageLink() view returns (string)",
  "function startDate() view returns (uint256)",
  "function endDate() view returns (uint256)",
  "function deployTime() view returns (uint256)"
];

export function usePublicSubContract() {
  const { data } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSubContractDetails = useCallback(async (contractAddress: string): Promise<SubContractDetails> => {
    if (!data.ethProvider) {
      throw new Error('Provider not available');
    }

    try {
      setIsLoading(true);
      setError(null);

      const contract = new ethers.Contract(
        contractAddress,
        PublicSubContractABI,
        data.ethProvider
      );

      // Try using individual getters first
      try {
        const [
          publicContractAddr,
          owner,
          status,
          version,
          jsonHash,
          softCopyHash,
          storageLink,
          startDate,
          endDate,
          deployTime
        ] = await Promise.all([
          contract.publicContractAddr(),
          contract.owner(),
          contract.status(),
          contract.version(),
          contract.jsonHash(),
          contract.softCopyHash(),
          contract.storageLink(),
          contract.startDate(),
          contract.endDate(),
          contract.deployTime()
        ]);

        return {
          publicContractAddr,
          owner,
          status: Number(status),
          version: Number(version),
          jsonHash,
          softCopyHash,
          storageLink,
          startDate: Number(startDate),
          endDate: Number(endDate),
          deployTime: Number(deployTime)
        };
      } catch (individualError) {
        console.warn('Failed to get details using individual getters, trying getDetail():', individualError);

        // Fallback to getDetail()
        const details = await contract.getDetail();
        
        return {
          publicContractAddr: details[0],
          owner: details[1],
          status: Number(details[2]),
          version: Number(details[3]),
          jsonHash: details[4],
          softCopyHash: details[5],
          storageLink: details[6],
          startDate: Number(details[7]),
          endDate: Number(details[8]),
          deployTime: Number(details[9])
        };
      }
    } catch (err) {
      console.error('Error getting sub-contract details:', err);
      setError(`Failed to get contract details: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);

  return {
    isLoading,
    error,
    getSubContractDetails
  };
}
