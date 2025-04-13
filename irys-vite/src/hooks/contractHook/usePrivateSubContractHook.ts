import { useState, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../../provider/dataProvider';
import { createContractFactories, waitForTransaction, findEventInLogs, eventInterfaces } from './utils';
import { BaseHookReturn, StatusUpdatedEvent, DataLinksUpdatedEvent, ContractStatus, UpdateDataLinksParams } from './types';

interface PrivateSubContractDetail {
  privateContractAddr: string;
  owner: string;
  parent: string;
  user: string;
  status: ContractStatus;
  version: number;
  jsonHash: string;
  softCopyHash: string;
  jsonLink: string;
  softCopyLink: string;
  startDate: number;
  endDate: number;
  deployTime: number;
}

interface PrivateSubContractReturn extends BaseHookReturn {
  // Read operations
  getSubContractDetails: (subContractAddress: string) => Promise<PrivateSubContractDetail>;
  verifyFileHash: (subContractAddress: string, fileHash: string, fileType: 'json' | 'softCopy') => Promise<boolean>;
  
  // Write operations (owner or parent only)
  updateStatus: (
    subContractAddress: string, 
    status: ContractStatus
  ) => Promise<StatusUpdatedEvent>;
  
  setUser: (
    subContractAddress: string, 
    userAddress: string
  ) => Promise<void>;
  
  // Write operations (user only)
  updateDataLinks: (
    subContractAddress: string,
    params: UpdateDataLinksParams
  ) => Promise<DataLinksUpdatedEvent>;
  
  // Events
  getStatusUpdatedEvents: (
    subContractAddress: string,
    fromBlock?: number,
    toBlock?: number
  ) => Promise<StatusUpdatedEvent[]>;
  
  getDataLinksUpdatedEvents: (
    subContractAddress: string,
    fromBlock?: number,
    toBlock?: number
  ) => Promise<DataLinksUpdatedEvent[]>;
}

/**
 * Hook for interacting with the PrivateSubContract
 */
export function usePrivateSubContract(): PrivateSubContractReturn {
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
      
      const { getPrivateSubContract } = createContractFactories(data.ethProvider);
      const subContract = getPrivateSubContract(subContractAddress);
      
      const details = await subContract.getDetail();
      
      return {
        privateContractAddr: details[0],
        owner: details[1],
        parent: details[2],
        user: details[3],
        status: details[4],
        version: Number(details[5]),
        jsonHash: details[6],
        softCopyHash: details[7],
        jsonLink: details[8],
        softCopyLink: details[9],
        startDate: Number(details[10]),
        endDate: Number(details[11]),
        deployTime: Number(details[12])
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
      
      const { getPrivateSubContract } = createContractFactories(data.ethProvider);
      const subContract = getPrivateSubContract(subContractAddress);
      
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
      
      const { getPrivateSubContract } = createContractFactories(data.ethProvider);
      const subContract = getPrivateSubContract(subContractAddress);
      const signer = await data.ethProvider.getSigner();
      
      const tx = await subContract.connect(signer).updateStatus(status);
      const receipt = await waitForTransaction(tx);
      
      const event = findEventInLogs<StatusUpdatedEvent>(
        receipt,
        'StatusUpdated',
        eventInterfaces.privateSubContract,
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
   * Set the user address (owner or parent only)
   */
  const setUser = useCallback(async (
    subContractAddress: string,
    userAddress: string
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      if (!ethers.isAddress(userAddress)) {
        throw new Error('Invalid user address');
      }
      
      const { getPrivateSubContract } = createContractFactories(data.ethProvider);
      const subContract = getPrivateSubContract(subContractAddress);
      const signer = await data.ethProvider.getSigner();
      
      const tx = await subContract.connect(signer).setUser(userAddress);
      await waitForTransaction(tx);
    } catch (err) {
      console.error('Error setting user address:', err);
      setError(`Failed to set user: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Update the data links (Arweave TxIDs) for JSON and soft copy files
   */
  const updateDataLinks = useCallback(async (
    subContractAddress: string,
    params: UpdateDataLinksParams
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPrivateSubContract } = createContractFactories(data.ethProvider);
      const subContract = getPrivateSubContract(subContractAddress);
      const signer = await data.ethProvider.getSigner();
      
      const tx = await subContract.connect(signer).updateDataLinks(
        params.jsonLink,
        params.softCopyLink
      );
      
      const receipt = await waitForTransaction(tx);
      
      const event = findEventInLogs<DataLinksUpdatedEvent>(
        receipt,
        'DataLinksUpdated',
        eventInterfaces.privateSubContract,
        (args) => ({
          subContractAddr: args.subContractAddr,
          userAddr: args.userAddr,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber
        })
      );
      
      if (!event) {
        throw new Error('Event not found in transaction logs');
      }
      
      return event;
    } catch (err) {
      console.error('Error updating data links:', err);
      setError(`Failed to update data links: ${(err as Error).message}`);
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
      
      const { getPrivateSubContract } = createContractFactories(data.ethProvider);
      const subContract = getPrivateSubContract(subContractAddress);
      
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
  
  /**
   * Get DataLinksUpdated events from blockchain
   */
  const getDataLinksUpdatedEvents = useCallback(async (
    subContractAddress: string,
    fromBlock?: number,
    toBlock?: number
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPrivateSubContract } = createContractFactories(data.ethProvider);
      const subContract = getPrivateSubContract(subContractAddress);
      
      const filter = subContract.filters.DataLinksUpdated();
      const events = await subContract.queryFilter(
        filter,
        fromBlock || 0,
        toBlock || 'latest'
      );
      
      const results: DataLinksUpdatedEvent[] = [];
      
      for (const event of events) {
        if (event.args) {
          results.push({
            subContractAddr: event.args.subContractAddr,
            userAddr: event.args.userAddr,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        }
      }
      
      return results;
    } catch (err) {
      console.error('Error getting DataLinksUpdated events:', err);
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
    setUser,
    updateDataLinks,
    getStatusUpdatedEvents,
    getDataLinksUpdatedEvents
  };
}
