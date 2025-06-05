import { useState, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../../provider/dataProvider';
import { createContractFactories, waitForTransaction, findEventInLogs, eventInterfaces } from './utils';

export function usePrivateContract() {
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
      
      const { getPrivateContract } = createContractFactories(data.ethProvider);
      const contract = getPrivateContract(contractAddress);
      
      const [owner, user, title, totalVerNo, activeVer] = await Promise.all([
        contract.owner(),
        contract.user(),
        contract.title(),
        contract.totalVerNo(),
        contract.activeVer()
      ]);
      
      return {
        owner,
        user,
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
      
      const { getPrivateContract } = createContractFactories(data.ethProvider);
      const contract = getPrivateContract(contractAddress);
      
      const subContracts = await contract.getAllPrivateSubContracts();
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
      
      const { getPrivateContract } = createContractFactories(data.ethProvider);
      const contract = getPrivateContract(contractAddress);
      
      const subContractAddress = await contract.getPrivateContractByIndex(index);
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
      
      const { getPrivateContract } = createContractFactories(data.ethProvider);
      const contract = getPrivateContract(contractAddress);
      
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
   * Add a new sub-contract version
   */
  const addNewPrivateSubContract = useCallback(async (
    contractAddress,
    params
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPrivateContract } = createContractFactories(data.ethProvider);
      const contract = getPrivateContract(contractAddress);
      const signer = await data.ethProvider.getSigner();
      
      const tx = await contract.connect(signer).addNewPrivateSubContract(
        params.jsonHash,
        params.softCopyHash,
        params.startDate,
        params.endDate
      );
      
      const receipt = await waitForTransaction(tx);
      
      const event = findEventInLogs(
        receipt,
        'NewPrivateSubContractOwned',
        eventInterfaces.privateContract,
        (args) => ({
          parentContractAddr: args.privateContractAddr,
          subContractAddr: args.subContractAddr,
          ownerAddr: args.ownerAddr,
          startDate: Number(args.startDate),
          endDate: Number(args.endDate),
          contractType: 'private',
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber
        })
      );
      
      if (!event) {
        throw new Error('Event not found in transaction logs');
      }
      
      return event;
    } catch (err) {
      console.error('Error adding new private sub-contract:', err);
      setError(`Failed to add sub-contract: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Activate contract with activation code
   */
  const activate = useCallback(async (
    contractAddress,
    activationCode
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPrivateContract } = createContractFactories(data.ethProvider);
      const contract = getPrivateContract(contractAddress);
      const signer = await data.ethProvider.getSigner();
      
      const tx = await contract.connect(signer).activate(activationCode);
      const receipt = await waitForTransaction(tx);
      
      const event = findEventInLogs(
        receipt,
        'PrivateContractActivated',
        eventInterfaces.privateContract,
        (args) => ({
          contractAddr: args.privateContractAddr,
          ownerAddr: args.ownerAddr,
          userAddr: args.userAddr,
          title: args.title,
          contractType: 'private',
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber
        })
      );
      
      if (!event) {
        throw new Error('Event not found in transaction logs');
      }
      
      return event;
    } catch (err) {
      console.error('Error activating private contract:', err);
      setError(`Failed to activate contract: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get NewPrivateSubContractOwned events from blockchain
   */
  const getNewPrivateSubContractEvents = useCallback(async (
    contractAddress,
    fromBlock,
    toBlock
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPrivateContract } = createContractFactories(data.ethProvider);
      const contract = getPrivateContract(contractAddress);
      
      const filter = contract.filters.NewPrivateSubContractOwned();
      const events = await contract.queryFilter(
        filter,
        fromBlock || 0,
        toBlock || 'latest'
      );
      
      const results = [];
      
      for (const event of events) {
        if (event.args) {
          results.push({
            parentContractAddr: event.args.privateContractAddr,
            subContractAddr: event.args.subContractAddr,
            ownerAddr: event.args.ownerAddr,
            startDate: Number(event.args.startDate),
            endDate: Number(event.args.endDate),
            contractType: 'private',
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        }
      }
      
      return results;
    } catch (err) {
      console.error('Error getting NewPrivateSubContractOwned events:', err);
      setError(`Failed to get events: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get PrivateContractActivated events from blockchain
   */
  const getPrivateContractActivatedEvents = useCallback(async (
    contractAddress,
    fromBlock,
    toBlock
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPrivateContract } = createContractFactories(data.ethProvider);
      const contract = getPrivateContract(contractAddress);
      
      const filter = contract.filters.PrivateContractActivated();
      const events = await contract.queryFilter(
        filter,
        fromBlock || 0,
        toBlock || 'latest'
      );
      
      const results = [];
      
      for (const event of events) {
        if (event.args) {
          results.push({
            contractAddr: event.args.privateContractAddr,
            ownerAddr: event.args.ownerAddr,
            userAddr: event.args.userAddr,
            title: event.args.title,
            contractType: 'private',
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        }
      }
      
      return results;
    } catch (err) {
      console.error('Error getting PrivateContractActivated events:', err);
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
    addNewPrivateSubContract,
    activate,
    getNewPrivateSubContractEvents,
    getPrivateContractActivatedEvents
  };
}
