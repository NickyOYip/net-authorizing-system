import { useState, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../../provider/dataProvider';
import { createContractFactories, waitForTransaction, findEventInLogs, eventInterfaces } from './utils';

export function useMasterFactory() {
  const { data } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const resetState = () => {
    setIsLoading(true);
    setError(null);
  };
  
  /**
   * Get the currently active factory addresses for each type
   */
  const getCurrentFactories = useCallback(async () => {
    try {
      resetState();
      
      if (!data.ethProvider || !data.factoryAddress) {
        throw new Error('Provider or factory address not available');
      }
      
      const { getMasterFactoryContract } = createContractFactories(data.ethProvider);
      const masterFactory = getMasterFactoryContract(data.factoryAddress);
      
      const [broadcastFactory, publicFactory, privateFactory] = await masterFactory.getCurrentVer();
      
      return {
        broadcastFactory,
        publicFactory,
        privateFactory
      };
    } catch (err) {
      console.error('Error getting current factories:', err);
      setError(`Failed to get current factories: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider, data.factoryAddress]);
  
  /**
   * Get all factory versions for each type
   */
  const getAllFactoryVersions = useCallback(async () => {
    try {
      resetState();
      
      if (!data.ethProvider || !data.factoryAddress) {
        throw new Error('Provider or factory address not available');
      }
      
      const { getMasterFactoryContract } = createContractFactories(data.ethProvider);
      const masterFactory = getMasterFactoryContract(data.factoryAddress);
      
      const [broadcastFactories, publicFactories, privateFactories] = await masterFactory.getAllVer();
      
      return {
        broadcastFactories,
        publicFactories,
        privateFactories
      };
    } catch (err) {
      console.error('Error getting all factory versions:', err);
      setError(`Failed to get all factory versions: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider, data.factoryAddress]);
  
  /**
   * Get current version numbers for each factory type
   */
  const getCurrentVersionNumbers = useCallback(async () => {
    try {
      resetState();
      
      if (!data.ethProvider || !data.factoryAddress) {
        throw new Error('Provider or factory address not available');
      }
      
      const { getMasterFactoryContract } = createContractFactories(data.ethProvider);
      const masterFactory = getMasterFactoryContract(data.factoryAddress);
      
      const [broadcastVer, publicVer, privateVer] = await Promise.all([
        masterFactory.broadcastFactoryCurrentVer(),
        masterFactory.publicFactoryCurrentVer(),
        masterFactory.privateFactoryCurrentVer()
      ]);
      
      return {
        broadcastVer: Number(broadcastVer),
        publicVer: Number(publicVer),
        privateVer: Number(privateVer)
      };
    } catch (err) {
      console.error('Error getting current version numbers:', err);
      setError(`Failed to get current version numbers: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider, data.factoryAddress]);
  
  /**
   * Get a factory address by its type and version
   */
  const getFactoryByVersion = useCallback(async (
    factoryType,
    version
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider || !data.factoryAddress) {
        throw new Error('Provider or factory address not available');
      }
      
      const { getMasterFactoryContract } = createContractFactories(data.ethProvider);
      const masterFactory = getMasterFactoryContract(data.factoryAddress);
      
      let factoryAddress;
      
      switch (factoryType) {
        case 'broadcast':
          factoryAddress = await masterFactory.broadcastFactoryAddrs(version);
          break;
        case 'public':
          factoryAddress = await masterFactory.publicFactoryAddrs(version);
          break;
        case 'private':
          factoryAddress = await masterFactory.privateFactoryAddrs(version);
          break;
        default:
          throw new Error('Invalid factory type');
      }
      
      return factoryAddress;
    } catch (err) {
      console.error('Error getting factory by version:', err);
      setError(`Failed to get factory by version: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider, data.factoryAddress]);
  
  /**
   * Add a new factory version (owner only)
   */
  const addFactoryVersion = useCallback(async (
    factoryType,
    newFactoryAddress
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider || !data.factoryAddress) {
        throw new Error('Provider or factory address not available');
      }
      
      if (!ethers.isAddress(newFactoryAddress)) {
        throw new Error('Invalid factory address');
      }
      
      const { getMasterFactoryContract } = createContractFactories(data.ethProvider);
      const masterFactory = getMasterFactoryContract(data.factoryAddress);
      const signer = await data.ethProvider.getSigner();
      
      let tx;
      
      switch (factoryType) {
        case 'broadcast':
          tx = await masterFactory.connect(signer).addBroadcastFactoryVer(newFactoryAddress);
          break;
        case 'public':
          tx = await masterFactory.connect(signer).addPublicFactoryVer(newFactoryAddress);
          break;
        case 'private':
          tx = await masterFactory.connect(signer).addPrivateFactoryVer(newFactoryAddress);
          break;
        default:
          throw new Error('Invalid factory type');
      }
      
      const receipt = await waitForTransaction(tx);
      
      const event = findEventInLogs(
        receipt,
        'NewVerContractPushed',
        eventInterfaces.masterFactory,
        (args) => ({
          factoryName: args.factoryName,
          verNo: Number(args.verNo),
          masterFactoryAddr: args.masterFactoryAddr,
          subFactoryAddr: args.subFactoryAddr,
          ownerAddr: args.ownerAddr,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber
        })
      );
      
      if (!event) {
        throw new Error('Event not found in transaction logs');
      }
      
      return event;
    } catch (err) {
      console.error('Error adding factory version:', err);
      setError(`Failed to add factory version: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider, data.factoryAddress]);
  
  /**
   * Update the active factory version (owner only)
   */
  const updateFactoryVersion = useCallback(async (
    factoryType,
    version
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider || !data.factoryAddress) {
        throw new Error('Provider or factory address not available');
      }
      
      const { getMasterFactoryContract } = createContractFactories(data.ethProvider);
      const masterFactory = getMasterFactoryContract(data.factoryAddress);
      const signer = await data.ethProvider.getSigner();
      
      let tx;
      
      switch (factoryType) {
        case 'broadcast':
          tx = await masterFactory.connect(signer).updateBroadcastFactoryVer(version);
          break;
        case 'public':
          tx = await masterFactory.connect(signer).updatePublicFactoryVer(version);
          break;
        case 'private':
          tx = await masterFactory.connect(signer).updatePrivateFactoryVer(version);
          break;
        default:
          throw new Error('Invalid factory type');
      }
      
      const receipt = await waitForTransaction(tx);
      
      const event = findEventInLogs(
        receipt,
        'UsingVer',
        eventInterfaces.masterFactory,
        (args) => ({
          factoryName: args.factoryName,
          verNo: Number(args.verNo),
          masterFactoryAddr: args.masterFactoryAddr,
          subFactoryAddr: args.subFactoryAddr,
          ownerAddr: args.ownerAddr,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber
        })
      );
      
      if (!event) {
        throw new Error('Event not found in transaction logs');
      }
      
      return event;
    } catch (err) {
      console.error('Error updating factory version:', err);
      setError(`Failed to update factory version: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider, data.factoryAddress]);
  
  /**
   * Get NewVerContractPushed events from blockchain
   */
  const getNewVerContractPushedEvents = useCallback(async (
    fromBlock,
    toBlock
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider || !data.factoryAddress) {
        throw new Error('Provider or factory address not available');
      }
      
      const { getMasterFactoryContract } = createContractFactories(data.ethProvider);
      const masterFactory = getMasterFactoryContract(data.factoryAddress);
      
      const filter = masterFactory.filters.NewVerContractPushed();
      const events = await masterFactory.queryFilter(
        filter,
        fromBlock || 0,
        toBlock || 'latest'
      );
      
      const results = [];
      
      for (const event of events) {
        if (event.args) {
          results.push({
            factoryName: event.args.factoryName,
            verNo: Number(event.args.verNo),
            masterFactoryAddr: event.args.masterFactoryAddr,
            subFactoryAddr: event.args.subFactoryAddr,
            ownerAddr: event.args.ownerAddr,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        }
      }
      
      return results;
    } catch (err) {
      console.error('Error getting NewVerContractPushed events:', err);
      setError(`Failed to get events: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider, data.factoryAddress]);
  
  /**
   * Get UsingVer events from blockchain
   */
  const getUsingVerEvents = useCallback(async (
    fromBlock,
    toBlock
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider || !data.factoryAddress) {
        throw new Error('Provider or factory address not available');
      }
      
      const { getMasterFactoryContract } = createContractFactories(data.ethProvider);
      const masterFactory = getMasterFactoryContract(data.factoryAddress);
      
      const filter = masterFactory.filters.UsingVer();
      const events = await masterFactory.queryFilter(
        filter,
        fromBlock || 0,
        toBlock || 'latest'
      );
      
      const results = [];
      
      for (const event of events) {
        if (event.args) {
          results.push({
            factoryName: event.args.factoryName,
            verNo: Number(event.args.verNo),
            masterFactoryAddr: event.args.masterFactoryAddr,
            subFactoryAddr: event.args.subFactoryAddr,
            ownerAddr: event.args.ownerAddr,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        }
      }
      
      return results;
    } catch (err) {
      console.error('Error getting UsingVer events:', err);
      setError(`Failed to get events: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider, data.factoryAddress]);
  
  return {
    isLoading,
    error,
    getCurrentFactories,
    getAllFactoryVersions,
    getCurrentVersionNumbers,
    getFactoryByVersion,
    addFactoryVersion,
    updateFactoryVersion,
    getNewVerContractPushedEvents,
    getUsingVerEvents
  };
}
