import { useState, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../../provider/dataProvider';
import { createContractFactories, waitForTransaction, findEventInLogs, eventInterfaces } from './utils';

/**
 * Hook for interacting with the PublicFactory contract
 */
export function usePublicFactory() {
  const { data } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const resetState = () => {
    setIsLoading(true);
    setError(null);
  };
  
  /**
   * Get all public contracts created by this factory
   */
  const getAllPublicContracts = useCallback(async (factoryAddress) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPublicFactoryContract } = createContractFactories(data.ethProvider);
      const factory = getPublicFactoryContract(factoryAddress);
      
      const contracts = await factory.getAllPublicContracts();
      return contracts;
    } catch (err) {
      console.error('Error getting all public contracts:', err);
      setError(`Failed to get contracts: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get a public contract by its index
   */
  const getPublicContractByIndex = useCallback(async (
    factoryAddress,
    index
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPublicFactoryContract } = createContractFactories(data.ethProvider);
      const factory = getPublicFactoryContract(factoryAddress);
      
      const contractAddress = await factory.getPublicContractByIndex(index);
      return contractAddress;
    } catch (err) {
      console.error('Error getting public contract by index:', err);
      setError(`Failed to get contract: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Create a new public contract
   */
  const createPublicContract = useCallback(async (
    factoryAddress,
    params
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPublicFactoryContract } = createContractFactories(data.ethProvider);
      const factory = getPublicFactoryContract(factoryAddress);
      const signer = await data.ethProvider.getSigner();
      
      const tx = await factory.connect(signer).createPublicContract(
        params.title,
        params.activationCode
      );
      
      const receipt = await waitForTransaction(tx);
      
      const event = findEventInLogs(
        receipt,
        'NewPublicContractOwned',
        eventInterfaces.publicFactory,
        (args) => ({
          factoryAddr: args.factoryAddr,
          contractAddr: args.contractAddr,
          ownerAddr: args.ownerAddr,
          title: args.title,
          contractType: 'public',
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber
        })
      );
      
      if (!event) {
        throw new Error('Event not found in transaction logs');
      }
      
      return event;
    } catch (err) {
      console.error('Error creating public contract:', err);
      setError(`Failed to create contract: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get NewPublicContractOwned events from blockchain
   */
  const getNewPublicContractEvents = useCallback(async (
    factoryAddress,
    fromBlock,
    toBlock
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPublicFactoryContract } = createContractFactories(data.ethProvider);
      const factory = getPublicFactoryContract(factoryAddress);
      
      const filter = factory.filters.NewPublicContractOwned();
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
            contractType: 'public',
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        }
      }
      
      return results;
    } catch (err) {
      console.error('Error getting NewPublicContractOwned events:', err);
      setError(`Failed to get events: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  return {
    isLoading,
    error,
    getAllPublicContracts,
    getPublicContractByIndex,
    createPublicContract,
    getNewPublicContractEvents
  };
}
