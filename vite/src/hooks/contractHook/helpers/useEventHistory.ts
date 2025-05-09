import { useState, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../../../provider/dataProvider';
import { ContractEvent } from '../types';

interface EventHistoryOptions {
  fromBlock?: number;
  toBlock?: number;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  indexedFilters?: {
    [key: string]: string;  // key is the indexed parameter name, value is the address/value to filter
  };
}

interface EventHistoryReturn {
  isLoading: boolean;
  error: string | null;
  getEventsByRange: <T extends ContractEvent>(
    contract: ethers.Contract,
    eventName: string,
    options?: EventHistoryOptions
  ) => Promise<T[]>;
  getEventsByTimeRange: <T extends ContractEvent>(
    contract: ethers.Contract,
    eventName: string,
    fromDate: Date,
    toDate: Date
  ) => Promise<T[]>;
  getEventsByOwner: <T extends ContractEvent>(
    contract: ethers.Contract,
    eventName: string,
    ownerAddress: string,
    options?: Omit<EventHistoryOptions, 'indexedFilters'>
  ) => Promise<T[]>;
  getEventsByContract: <T extends ContractEvent>(
    contract: ethers.Contract,
    eventName: string,
    contractAddress: string,
    options?: Omit<EventHistoryOptions, 'indexedFilters'>
  ) => Promise<T[]>;
}

export function useEventHistory(): EventHistoryReturn {
  const { data } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBlockNumberByTimestamp = useCallback(async (
    timestamp: number,
    searchStart: number,
    searchEnd: number
  ): Promise<number> => {
    if (!data.ethProvider) throw new Error('Provider not available');

    let left = searchStart;
    let right = searchEnd;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const block = await data.ethProvider.getBlock(mid);
      if (!block) continue;

      if (Number(block.timestamp) === timestamp) {
        return mid;
      } else if (Number(block.timestamp) < timestamp) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    return left; // Return closest block
  }, [data.ethProvider]);

  const getEventsByRange = useCallback(async <T extends ContractEvent>(
    contract: ethers.Contract,
    eventName: string,
    options: EventHistoryOptions = {}
  ): Promise<T[]> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }

      const latestBlock = await data.ethProvider.getBlockNumber();
      const fromBlock = options.fromBlock || 0;
      const toBlock = options.toBlock || latestBlock;

      // Create filter with indexed parameters if provided
      const filter = options.indexedFilters 
        ? contract.filters[eventName](...Object.values(options.indexedFilters))
        : contract.filters[eventName]();

      const events = await contract.queryFilter(filter, fromBlock, toBlock);
      const results: T[] = [];
      
      for (const event of events) {
        if (!event.args) continue;

        const block = await data.ethProvider.getBlock(event.blockNumber);
        const timestamp = block ? Number(block.timestamp) : 0;

        const eventData = {
          ...event.args,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp
        } as T;

        results.push(eventData);
      }

      if (options.limit) {
        return results.slice(0, options.limit);
      }

      return results;
    } catch (err) {
      console.error(`Error fetching ${eventName} events:`, err);
      setError(`Failed to fetch events: ${(err as Error).message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);

  const getEventsByTimeRange = useCallback(async <T extends ContractEvent>(
    contract: ethers.Contract,
    eventName: string,
    fromDate: Date,
    toDate: Date
  ): Promise<T[]> => {
    try {
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }

      const latestBlock = await data.ethProvider.getBlockNumber();
      const fromTimestamp = Math.floor(fromDate.getTime() / 1000);
      const toTimestamp = Math.floor(toDate.getTime() / 1000);

      // Find blocks closest to timestamps
      const fromBlock = await getBlockNumberByTimestamp(fromTimestamp, 0, latestBlock);
      const toBlock = await getBlockNumberByTimestamp(toTimestamp, fromBlock, latestBlock);

      return getEventsByRange<T>(contract, eventName, { fromBlock, toBlock });
    } catch (err) {
      console.error(`Error fetching ${eventName} events by time range:`, err);
      setError(`Failed to fetch events: ${(err as Error).message}`);
      return [];
    }
  }, [data.ethProvider, getBlockNumberByTimestamp, getEventsByRange]);

  const getEventsByOwner = useCallback(async <T extends ContractEvent>(
    contract: ethers.Contract,
    eventName: string,
    ownerAddress: string,
    options: Omit<EventHistoryOptions, 'indexedFilters'> = {}
  ): Promise<T[]> => {
    return getEventsByRange<T>(contract, eventName, {
      ...options,
      indexedFilters: { ownerAddr: ownerAddress }
    });
  }, [getEventsByRange]);

  const getEventsByContract = useCallback(async <T extends ContractEvent>(
    contract: ethers.Contract,
    eventName: string,
    contractAddress: string,
    options: Omit<EventHistoryOptions, 'indexedFilters'> = {}
  ): Promise<T[]> => {
    return getEventsByRange<T>(contract, eventName, {
      ...options,
      indexedFilters: { contractAddr: contractAddress }
    });
  }, [getEventsByRange]);

  return {
    isLoading,
    error,
    getEventsByRange,
    getEventsByTimeRange,
    getEventsByOwner,
    getEventsByContract
  };
}
