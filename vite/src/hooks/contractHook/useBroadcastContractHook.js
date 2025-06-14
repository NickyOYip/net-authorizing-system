import { useState, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../../provider/dataProvider';
import { createContractFactories, waitForTransaction, findEventInLogs, eventInterfaces } from './utils';

export function useBroadcastContract() {
  const { data } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const resetState = () => {
    setIsLoading(true);
    setError(null);
  };
  
  /**
   * Get contract details
   */
  const getContractDetails = useCallback(async (contractAddress) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getBroadcastContract } = createContractFactories(data.ethProvider);
      const contract = getBroadcastContract(contractAddress);
      
      const [owner, title, totalVerNo, activeVer] = await Promise.all([
        contract.owner(),
        contract.title(),
        contract.totalVerNo(),
        contract.activeVer()
      ]);
      
      return {
        owner,
        title,
        totalVerNo: Number(totalVerNo),
        activeVer: Number(activeVer)
      };
    } catch (err) {
      console.error('Error getting contract details:', err);
      setError(`Failed to get contract details: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get all versions of this contract
   */
  const getAllVersions = useCallback(async (contractAddress) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getBroadcastContract } = createContractFactories(data.ethProvider);
      const contract = getBroadcastContract(contractAddress);
      
      const subContracts = await contract.getAllBroadcastSubContracts();
      return subContracts;
    } catch (err) {
      console.error('Error getting all versions:', err);
      setError(`Failed to get versions: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get a specific version by index
   */
  const getVersionByIndex = useCallback(async (
    contractAddress,
    index
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getBroadcastContract } = createContractFactories(data.ethProvider);
      const contract = getBroadcastContract(contractAddress);
      
      const subContractAddress = await contract.getBroadcastContractByIndex(index);
      return subContractAddress;
    } catch (err) {
      console.error('Error getting version by index:', err);
      setError(`Failed to get version: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get current active version
   */
  const getCurrentVersion = useCallback(async (contractAddress) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getBroadcastContract } = createContractFactories(data.ethProvider);
      const contract = getBroadcastContract(contractAddress);
      
      const currentVersionAddress = await contract.getCurrentVersion();
      return currentVersionAddress;
    } catch (err) {
      console.error('Error getting current version:', err);
      setError(`Failed to get current version: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get version by version number
   */
  const getVersionByNumber = useCallback(async (
    contractAddress,
    versionNumber
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getBroadcastContract } = createContractFactories(data.ethProvider);
      const contract = getBroadcastContract(contractAddress);
      
      const subContractAddress = await contract.versions(versionNumber);
      return subContractAddress;
    } catch (err) {
      console.error('Error getting version by number:', err);
      setError(`Failed to get version: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Add a new sub-contract version
   */
  const addNewBroadcastSubContract = useCallback(async (
    contractAddress,
    params
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getBroadcastContract } = createContractFactories(data.ethProvider);
      const contract = getBroadcastContract(contractAddress);
      const signer = await data.ethProvider.getSigner();
      
      const tx = await contract.connect(signer).addNewBroadcastSubContract(
        params.jsonHash,
        params.softCopyHash,
        params.storageLink,
        params.startDate,
        params.endDate
      );
      
      const receipt = await waitForTransaction(tx);
      
      const event = findEventInLogs(
        receipt,
        'NewBroadcastSubContractOwned',
        eventInterfaces.broadcastContract,
        (args) => ({
          parentContractAddr: args.broadcastContractAddr,
          subContractAddr: args.subContractAddr,
          ownerAddr: args.ownerAddr,
          startDate: Number(args.startDate),
          endDate: Number(args.endDate),
          contractType: 'broadcast',
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber
        })
      );
      
      if (!event) {
        throw new Error('Event not found in transaction logs');
      }
      
      return event;
    } catch (err) {
      console.error('Error adding new broadcast sub-contract:', err);
      setError(`Failed to add sub-contract: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get NewBroadcastSubContractOwned events from blockchain
   */
  const getNewBroadcastSubContractEvents = useCallback(async (
    contractAddress,
    fromBlock,
    toBlock
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getBroadcastContract } = createContractFactories(data.ethProvider);
      const contract = getBroadcastContract(contractAddress);
      
      const filter = contract.filters.NewBroadcastSubContractOwned();
      const events = await contract.queryFilter(
        filter,
        fromBlock || 0,
        toBlock || 'latest'
      );
      
      const results = [];
      
      for (const event of events) {
        if (event.args) {
          results.push({
            parentContractAddr: event.args.broadcastContractAddr,
            subContractAddr: event.args.subContractAddr,
            ownerAddr: event.args.ownerAddr,
            startDate: Number(event.args.startDate),
            endDate: Number(event.args.endDate),
            contractType: 'broadcast',
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        }
      }
      
      return results;
    } catch (err) {
      console.error('Error getting NewBroadcastSubContractOwned events:', err);
      setError(`Failed to get events: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  return {
    isLoading,
    error,
    getContractDetails,
    getAllVersions,
    getVersionByIndex,
    getCurrentVersion,
    getVersionByNumber,
    addNewBroadcastSubContract,
    getNewBroadcastSubContractEvents
  };
}
