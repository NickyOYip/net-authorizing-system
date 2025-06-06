import { useState, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../../../provider/dataProvider';

export function useEventHistory() {
  const { data } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getBlockNumberByTimestamp = useCallback(async (
    timestamp,
    searchStart,
    searchEnd
  ) => {
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

  const getEventsByRange = useCallback(async (
    contract,
    eventName,
    options = {}
  ) => {
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
      const results = [];
      
      for (const event of events) {
        if (!event.args) continue;

        const block = await data.ethProvider.getBlock(event.blockNumber);
        const timestamp = block ? Number(block.timestamp) : 0;

        const eventData = {
          ...event.args,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp
        };

        results.push(eventData);
      }

      if (options.limit) {
        return results.slice(0, options.limit);
      }

      return results;
    } catch (err) {
      console.error(`Error fetching ${eventName} events:`, err);
      setError(`Failed to fetch events: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);

  const getEventsByTimeRange = useCallback(async (
    contract,
    eventName,
    fromDate,
    toDate
  ) => {
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

      return getEventsByRange(contract, eventName, { fromBlock, toBlock });
    } catch (err) {
      console.error(`Error fetching ${eventName} events by time range:`, err);
      setError(`Failed to fetch events: ${err.message}`);
      return [];
    }
  }, [data.ethProvider, getBlockNumberByTimestamp, getEventsByRange]);

  const getEventsByOwner = useCallback(async (
    contract,
    eventName,
    ownerAddress,
    options = {}
  ) => {
    return getEventsByRange(contract, eventName, {
      ...options,
      indexedFilters: { ownerAddr: ownerAddress }
    });
  }, [getEventsByRange]);

  const getEventsByContract = useCallback(async (
    contract,
    eventName,
    contractAddress,
    options = {}
  ) => {
    return getEventsByRange(contract, eventName, {
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
