import { useState, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../../provider/dataProvider';
import { createContractFactories, waitForTransaction, findEventInLogs, eventInterfaces } from './utils';

export function usePrivateSubContract() {
  const { data } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const resetState = () => {
    setIsLoading(true);
    setError(null);
  };
  
  /**
   * Get all contract details
   */
  const getSubContractDetails = useCallback(async (subContractAddress) => {
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
      setError(`Failed to get sub-contract details: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Verify file hashes against stored hashes
   * Accepts (subContractAddress, fileHash, fileType)
   */
  const verifyFileHash = useCallback(async (
    subContractAddress,
    fileHash,
    fileType
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPrivateSubContract } = createContractFactories(data.ethProvider);
      const subContract = getPrivateSubContract(subContractAddress);
      const details = await subContract.getDetail();
      // details[6] = jsonHash, details[7] = softCopyHash
      let storedHash;
      if (fileType === 'json') {
        storedHash = details[6];
      } else {
        storedHash = details[7];
      }
      return fileHash === storedHash;
    } catch (err) {
      console.error('Error verifying file hash:', err);
      setError(`Failed to verify file: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Update the contract status (active/disabled)
   */
  const updateStatus = useCallback(async (
    subContractAddress,
    status
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
      
      const event = findEventInLogs(
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
      setError(`Failed to update status: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Set the user address (owner or parent only)
   */
  const setUser = useCallback(async (
    subContractAddress,
    userAddress
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
      setError(`Failed to set user: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Update the data links (Arweave TxIDs) for JSON and soft copy files
   */
  const updateDataLinks = useCallback(async (
    subContractAddress,
    params
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
      
      const event = findEventInLogs(
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
      setError(`Failed to update data links: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get StatusUpdated events from blockchain
   */
  const getStatusUpdatedEvents = useCallback(async (
    subContractAddress,
    fromBlock,
    toBlock
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
      
      const results = [];
      
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
      setError(`Failed to get events: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get DataLinksUpdated events from blockchain
   */
  const getDataLinksUpdatedEvents = useCallback(async (
    subContractAddress,
    fromBlock,
    toBlock
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
      
      const results = [];
      
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
      setError(`Failed to get events: ${err.message}`);
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
