import { useState, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../../provider/dataProvider';
import { createContractFactories, waitForTransaction, findEventInLogs, eventInterfaces } from './utils';

/**
 * Hook for interacting with the BroadcastFactory contract
 */
export function useBroadcastFactory() {
  const { data } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const resetState = () => {
    setIsLoading(true);
    setError(null);
  };
  
  /**
   * Get all broadcast contracts created by this factory
   */
  const getAllBroadcastContracts = useCallback(async (factoryAddress) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getBroadcastFactoryContract } = createContractFactories(data.ethProvider);
      const factory = getBroadcastFactoryContract(factoryAddress);
      
      const contracts = await factory.getAllBroadcastContracts();
      return contracts;
    } catch (err) {
      console.error('Error getting all broadcast contracts:', err);
      setError(`Failed to get contracts: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get a broadcast contract by its index
   */
  const getBroadcastContractByIndex = useCallback(async (
    factoryAddress,
    index
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getBroadcastFactoryContract } = createContractFactories(data.ethProvider);
      const factory = getBroadcastFactoryContract(factoryAddress);
      
      const contractAddress = await factory.getBroadcastContractByIndex(index);
      return contractAddress;
    } catch (err) {
      console.error('Error getting broadcast contract by index:', err);
      setError(`Failed to get contract: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Create a new broadcast contract
   */
  const createBroadcastContract = useCallback(async (
    factoryAddress,
    params
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getBroadcastFactoryContract } = createContractFactories(data.ethProvider);
      const factory = getBroadcastFactoryContract(factoryAddress);
      const signer = await data.ethProvider.getSigner();
      
      const tx = await factory.connect(signer).createBroadcastContract(params.title);
      const receipt = await waitForTransaction(tx);
      
      const event = findEventInLogs(
        receipt,
        'NewBroadcastContractOwned',
        eventInterfaces.broadcastFactory,
        (args) => ({
          factoryAddr: args.factoryAddr,
          contractAddr: args.contractAddr,
          ownerAddr: args.ownerAddr,
          title: args.title,
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
      console.error('Error creating broadcast contract:', err);
      setError(`Failed to create contract: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get NewBroadcastContractOwned events from blockchain
   */
  const getNewBroadcastContractEvents = useCallback(async (
    factoryAddress,
    fromBlock,
    toBlock
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getBroadcastFactoryContract } = createContractFactories(data.ethProvider);
      const factory = getBroadcastFactoryContract(factoryAddress);
      
      const filter = factory.filters.NewBroadcastContractOwned();
      const events = await factory.queryFilter(
        filter,
        fromBlock || 0,
        toBlock || 'latest'
      );
      
      const results = [];
      
      for (const event of events) {
        if (event.args) {
          results.push({
            factoryAddr: event.args.factoryAddr,
            contractAddr: event.args.contractAddr,
            ownerAddr: event.args.ownerAddr,
            title: event.args.title,
            contractType: 'broadcast',
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        }
      }
      
      return results;
    } catch (err) {
      console.error('Error getting NewBroadcastContractOwned events:', err);
      setError(`Failed to get events: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  return {
    isLoading,
    error,
    getAllBroadcastContracts,
    getBroadcastContractByIndex,
    createBroadcastContract,
    getNewBroadcastContractEvents
  };
}
