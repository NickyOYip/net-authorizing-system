import { useState, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../../provider/dataProvider';
import { createContractFactories, waitForTransaction, findEventInLogs, eventInterfaces } from './utils';

/**
 * Hook for interacting with the PrivateFactory contract
 */
export function usePrivateFactory() {
  const { data } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const resetState = () => {
    setIsLoading(true);
    setError(null);
  };
  
  /**
   * Get all private contracts created by this factory
   */
  const getAllPrivateContracts = useCallback(async (factoryAddress) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPrivateFactoryContract } = createContractFactories(data.ethProvider);
      const factory = getPrivateFactoryContract(factoryAddress);
      
      const contracts = await factory.getAllPrivateContracts();
      return contracts;
    } catch (err) {
      console.error('Error getting all private contracts:', err);
      setError(`Failed to get contracts: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get a private contract by its index
   */
  const getPrivateContractByIndex = useCallback(async (
    factoryAddress,
    index
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPrivateFactoryContract } = createContractFactories(data.ethProvider);
      const factory = getPrivateFactoryContract(factoryAddress);
      
      const contractAddress = await factory.getPrivateContractByIndex(index);
      return contractAddress;
    } catch (err) {
      console.error('Error getting private contract by index:', err);
      setError(`Failed to get contract: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Create a new private contract
   */
  const createPrivateContract = useCallback(async (
    factoryAddress,
    params
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPrivateFactoryContract } = createContractFactories(data.ethProvider);
      const factory = getPrivateFactoryContract(factoryAddress);
      const signer = await data.ethProvider.getSigner();
      
      const tx = await factory.connect(signer).createPrivateContract(
        params.title,
        params.activationCode
      );
      const receipt = await waitForTransaction(tx);
      
      const event = findEventInLogs(
        receipt,
        'NewPrivateContractOwned',
        eventInterfaces.privateFactory,
        (args) => ({
          factoryAddr: args.factoryAddr,
          contractAddr: args.contractAddr,
          ownerAddr: args.ownerAddr,
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
      console.error('Error creating private contract:', err);
      setError(`Failed to create contract: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get NewPrivateContractOwned events from blockchain
   */
  const getNewPrivateContractEvents = useCallback(async (
    factoryAddress,
    fromBlock,
    toBlock
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPrivateFactoryContract } = createContractFactories(data.ethProvider);
      const factory = getPrivateFactoryContract(factoryAddress);
      
      const filter = factory.filters.NewPrivateContractOwned();
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
            contractType: 'private',
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        }
      }
      
      return results;
    } catch (err) {
      console.error('Error getting NewPrivateContractOwned events:', err);
      setError(`Failed to get events: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  return {
    isLoading,
    error,
    getAllPrivateContracts,
    getPrivateContractByIndex,
    createPrivateContract,
    getNewPrivateContractEvents
  };
}
