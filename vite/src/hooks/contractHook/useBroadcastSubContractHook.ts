import { useState, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../../provider/dataProvider';
import { createContractFactories, waitForTransaction, findEventInLogs, eventInterfaces } from './utils';
import { BaseHookReturn, StatusUpdatedEvent, ContractStatus } from './types';

interface BroadcastSubContractDetail {
  broadcastContractAddr: string;
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

interface BroadcastSubContractReturn extends BaseHookReturn {
  // Read operations
  getSubContractDetails: (subContractAddress: string) => Promise<BroadcastSubContractDetail>;
  verifyFileHash: (subContractAddress: string, fileHash: string, fileType: 'json' | 'softCopy') => Promise<boolean>;
  
  // Write operations (owner or parent only)
  updateStatus: (
    subContractAddress: string, 
    status: ContractStatus
  ) => Promise<StatusUpdatedEvent>;
  
  // Events
  getStatusUpdatedEvents: (
    subContractAddress: string,
    fromBlock?: number,
    toBlock?: number
  ) => Promise<StatusUpdatedEvent[]>;
}

/**
 * Hook for interacting with the BroadcastSubContract
 */
export function useBroadcastSubContract(): BroadcastSubContractReturn {
  const { data } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const resetState = () => {
    setIsLoading(true);
    setError(null);
  };
  
  /**
   * Get all contract details
   */
  const getSubContractDetails = useCallback(async (subContractAddress: string) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getBroadcastSubContract } = createContractFactories(data.ethProvider);
      const subContract = getBroadcastSubContract(subContractAddress);
      
      const details = await subContract.getDetail();
      
      return {
        broadcastContractAddr: details[0],
        owner: details[1],
        status: details[2],
        version: Number(details[3]),
        jsonHash: details[4],
        softCopyHash: details[5],
        storageLink: details[6],
        startDate: Number(details[7]),
        endDate: Number(details[8]),
        deployTime: Number(details[9])
      };
    } catch (err) {
      console.error('Error getting sub-contract details:', err);
      setError(`Failed to get sub-contract details: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Verify a file against the stored hash
   */
  const verifyFileHash = useCallback(async (
    subContractAddress: string,
    fileHash: string,
    fileType: 'json' | 'softCopy'
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getBroadcastSubContract } = createContractFactories(data.ethProvider);
      const subContract = getBroadcastSubContract(subContractAddress);
      
      let storedHash: string;
      if (fileType === 'json') {
        storedHash = await subContract.jsonHash();
      } else {
        storedHash = await subContract.softCopyHash();
      }
      
      return fileHash === storedHash;
    } catch (err) {
      console.error('Error verifying file hash:', err);
      setError(`Failed to verify file: ${(err as Error).message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Update the contract status (active/disabled)
   */
  const updateStatus = useCallback(async (
    subContractAddress: string,
    status: ContractStatus
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getBroadcastSubContract } = createContractFactories(data.ethProvider);
      const subContract = getBroadcastSubContract(subContractAddress);
      const signer = await data.ethProvider.getSigner();
      
      const tx = await subContract.connect(signer).updateStatus(status);
      const receipt = await waitForTransaction(tx);
      
      const event = findEventInLogs<StatusUpdatedEvent>(
        receipt,
        'StatusUpdated',
        eventInterfaces.broadcastSubContract,
        (args) => ({
          subContractAddr: args.subContractAddr,
          status: args.status,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber
        })
      );
      
      if (!event) {
        throw new Error('Event not found in transaction logs');
      }
      
      return event;
    } catch (err) {
      console.error('Error updating contract status:', err);
      setError(`Failed to update status: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get StatusUpdated events from blockchain
   */
  const getStatusUpdatedEvents = useCallback(async (
    subContractAddress: string,
    fromBlock?: number,
    toBlock?: number
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getBroadcastSubContract } = createContractFactories(data.ethProvider);
      const subContract = getBroadcastSubContract(subContractAddress);
      
      const filter = subContract.filters.StatusUpdated();
      const events = await subContract.queryFilter(
        filter,
        fromBlock || 0,
        toBlock || 'latest'
      );
      
      const results: StatusUpdatedEvent[] = [];
      
      for (const event of events) {
        if (event.args) {
          results.push({
            subContractAddr: event.args.subContractAddr,
            status: event.args.status,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        }
      }
      
      return results;
    } catch (err) {
      console.error('Error getting StatusUpdated events:', err);
      setError(`Failed to get events: ${(err as Error).message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  return {
    isLoading,
    error,
    getSubContractDetails,
    verifyFileHash,
    updateStatus,
    getStatusUpdatedEvents
  };
}
