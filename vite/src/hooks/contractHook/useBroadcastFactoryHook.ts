import { useState, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../../provider/dataProvider';
import { createContractFactories, waitForTransaction, findEventInLogs, eventInterfaces } from './utils';
import { BaseHookReturn, NewContractOwnedEvent, CreateBroadcastParams } from './types';

interface BroadcastFactoryReturn extends BaseHookReturn {
  // Read operations
  getAllBroadcastContracts: (factoryAddress: string) => Promise<string[]>;
  getBroadcastContractByIndex: (factoryAddress: string, index: number) => Promise<string>;
  
  // Write operations
  createBroadcastContract: (
    factoryAddress: string, 
    params: CreateBroadcastParams
  ) => Promise<NewContractOwnedEvent>;
  
  // Events
  getNewBroadcastContractEvents: (
    factoryAddress: string,
    fromBlock?: number,
    toBlock?: number
  ) => Promise<NewContractOwnedEvent[]>;
}

/**
 * Hook for interacting with the BroadcastFactory contract
 */
export function useBroadcastFactory(): BroadcastFactoryReturn {
  const { data } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const resetState = () => {
    setIsLoading(true);
    setError(null);
  };
  
  /**
   * Get all broadcast contracts created by this factory
   */
  const getAllBroadcastContracts = useCallback(async (factoryAddress: string) => {
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
      setError(`Failed to get contracts: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get a broadcast contract by its index
   */
  const getBroadcastContractByIndex = useCallback(async (
    factoryAddress: string,
    index: number
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
      setError(`Failed to get contract: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Create a new broadcast contract
   */
  const createBroadcastContract = useCallback(async (
    factoryAddress: string,
    params: CreateBroadcastParams
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
      
      const event = findEventInLogs<NewContractOwnedEvent>(
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
      setError(`Failed to create contract: ${(err as Error).message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get NewBroadcastContractOwned events from blockchain
   */
  const getNewBroadcastContractEvents = useCallback(async (
    factoryAddress: string,
    fromBlock?: number,
    toBlock?: number
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
      
      const results: NewContractOwnedEvent[] = [];
      
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
      setError(`Failed to get events: ${(err as Error).message}`);
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
