import { useState, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../../provider/dataProvider';
import { createContractFactories, waitForTransaction, findEventInLogs, eventInterfaces } from './utils';

export function useBroadcastSubContract() {
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
      setError(`Failed to get sub-contract details: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Verify a file against the stored hash
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
      
      const { getBroadcastSubContract } = createContractFactories(data.ethProvider);
      const subContract = getBroadcastSubContract(subContractAddress);
      
      let storedHash;
      if (fileType === 'json') {
        storedHash = await subContract.jsonHash();
      } else {
        storedHash = await subContract.softCopyHash();
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
      
      const { getBroadcastSubContract } = createContractFactories(data.ethProvider);
      const subContract = getBroadcastSubContract(subContractAddress);
      const signer = await data.ethProvider.getSigner();
      
      const tx = await subContract.connect(signer).updateStatus(status);
      const receipt = await waitForTransaction(tx);
      
      const event = findEventInLogs(
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
      setError(`Failed to update status: ${err.message}`);
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
      
      const { getBroadcastSubContract } = createContractFactories(data.ethProvider);
      const subContract = getBroadcastSubContract(subContractAddress);
      
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
   * Get individual state variables
   */
  const getContractVariables = useCallback(async (subContractAddress) => {
    try {
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }

      const { getBroadcastSubContract } = createContractFactories(data.ethProvider);
      const contract = getBroadcastSubContract(subContractAddress);

      const [
        broadcastAddr,
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
        contract.broadcastContractAddr(),
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
        broadcastAddr,
        owner,
        status,
        version: Number(version),
        jsonHash,
        softCopyHash,
        storageLink,
        startDate: Number(startDate),
        endDate: Number(endDate),
        deployTime: Number(deployTime)
      };
    } catch (err) {
      setError(`Failed to get contract variables: ${err.message}`);
      throw err;
    }
  }, [data.ethProvider]);
  
  return {
    isLoading,
    error,
    getSubContractDetails,
    verifyFileHash,
    updateStatus,
    getStatusUpdatedEvents,
    getContractVariables
  };
}
