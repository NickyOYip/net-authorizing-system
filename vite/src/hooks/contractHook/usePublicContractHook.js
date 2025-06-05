import { useState, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../../provider/dataProvider';
import { createContractFactories, waitForTransaction, findEventInLogs, eventInterfaces } from './utils';

export function usePublicContract() {
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

      if (!contractAddress || !ethers.isAddress(contractAddress)) {
        throw new Error(`Invalid contract address: ${contractAddress}`);
      }

      const { getPublicContract } = createContractFactories(data.ethProvider);
      const contract = getPublicContract(contractAddress);

      // First verify the contract exists and has code
      const code = await data.ethProvider.getCode(contractAddress);
      if (code === '0x') {
        throw new Error(`No contract found at address: ${contractAddress}`);
      }

      try {
        // Test if contract has required methods
        await contract.owner();
      } catch (e) {
        throw new Error(`Address ${contractAddress} is not a valid Public Contract`);
      }

      // Now fetch all details
      const [owner, user, title, totalVerNo, activeVer] = await Promise.all([
        contract.owner().catch(() => 'Unknown'),
        contract.user().catch(() => 'None'),
        contract.title().catch(() => 'Untitled'),
        contract.totalVerNo().catch(() => 0),
        contract.activeVer().catch(() => 0)
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
      
      const { getPublicContract } = createContractFactories(data.ethProvider);
      const contract = getPublicContract(contractAddress);

      // First get total number of versions
      const totalVerNo = await contract.totalVerNo();
      console.log("Total versions:", Number(totalVerNo));

      const versions = [];
      
      // Iterate through each version number starting from 1
      for (let i = 1; i <= Number(totalVerNo); i++) {
        try {
          // Get contract address from versions mapping
          const versionAddr = await contract.versions(i);
          
          // Check if address is valid and not zero address
          if (versionAddr && versionAddr !== ethers.ZeroAddress) {
            versions.push(versionAddr);
            console.log(`Version ${i} address:`, versionAddr);
          }
        } catch (verErr) {
          console.warn(`Error fetching version ${i}:`, verErr);
          continue;
        }
      }

      console.log("Retrieved versions:", versions);
      return versions;

    } catch (err) {
      console.error('Error getting all versions:', err);
      setError(`Failed to get versions: ${err.message}`);
      return [];
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
      
      const { getPublicContract } = createContractFactories(data.ethProvider);
      const contract = getPublicContract(contractAddress);
      
      // Changed function name to match contract
      const subContractAddress = await contract.getPublicSubContractByIndex(index);
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
      
      const { getPublicContract } = createContractFactories(data.ethProvider);
      const contract = getPublicContract(contractAddress);
      
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
  const addNewPublicSubContract = useCallback(async (
    contractAddress,
    params
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPublicContract } = createContractFactories(data.ethProvider);
      const contract = getPublicContract(contractAddress);
      const signer = await data.ethProvider.getSigner();
      
      const tx = await contract.connect(signer).addNewPublicSubContract(
        params.jsonHash,
        params.softCopyHash,
        params.storageLink,
        params.startDate,
        params.endDate
      );
      
      const receipt = await waitForTransaction(tx);
      
      const event = findEventInLogs(
        receipt,
        'NewPublicSubContractOwned',
        eventInterfaces.publicContract,
        (args) => ({
          parentContractAddr: args.publicContractAddr,
          subContractAddr: args.subContractAddr,
          ownerAddr: args.ownerAddr,
          startDate: Number(args.startDate),
          endDate: Number(args.endDate),
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
      console.error('Error adding new public sub-contract:', err);
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
      
      const { getPublicContract } = createContractFactories(data.ethProvider);
      const contract = getPublicContract(contractAddress);
      const signer = await data.ethProvider.getSigner();
      
      const tx = await contract.connect(signer).activate(activationCode);
      const receipt = await waitForTransaction(tx);
      
      const event = findEventInLogs(
        receipt,
        'PublicContractActivated',
        eventInterfaces.publicContract,
        (args) => ({
          contractAddr: args.publicContractAddr,
          ownerAddr: args.ownerAddr,
          userAddr: args.userAddr,
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
      console.error('Error activating public contract:', err);
      setError(`Failed to activate contract: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get NewPublicSubContractOwned events from blockchain
   */
  const getNewPublicSubContractEvents = useCallback(async (
    contractAddress,
    fromBlock,
    toBlock
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPublicContract } = createContractFactories(data.ethProvider);
      const contract = getPublicContract(contractAddress);
      
      const filter = contract.filters.NewPublicSubContractOwned();
      const events = await contract.queryFilter(
        filter,
        fromBlock || 0,
        toBlock || 'latest'
      );
      
      const results = [];
      
      for (const event of events) {
        if (event.args) {
          results.push({
            parentContractAddr: event.args.publicContractAddr,
            subContractAddr: event.args.subContractAddr,
            ownerAddr: event.args.ownerAddr,
            startDate: Number(event.args.startDate),
            endDate: Number(event.args.endDate),
            contractType: 'public',
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        }
      }
      
      return results;
    } catch (err) {
      console.error('Error getting NewPublicSubContractOwned events:', err);
      setError(`Failed to get events: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [data.ethProvider]);
  
  /**
   * Get PublicContractActivated events from blockchain
   */
  const getPublicContractActivatedEvents = useCallback(async (
    contractAddress,
    fromBlock,
    toBlock
  ) => {
    try {
      resetState();
      
      if (!data.ethProvider) {
        throw new Error('Provider not available');
      }
      
      const { getPublicContract } = createContractFactories(data.ethProvider);
      const contract = getPublicContract(contractAddress);
      
      const filter = contract.filters.PublicContractActivated();
      const events = await contract.queryFilter(
        filter,
        fromBlock || 0,
        toBlock || 'latest'
      );
      
      const results = [];
      
      for (const event of events) {
        if (event.args) {
          results.push({
            contractAddr: event.args.publicContractAddr,
            ownerAddr: event.args.ownerAddr,
            userAddr: event.args.userAddr,
            title: event.args.title,
            contractType: 'public',
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        }
      }
      
      return results;
    } catch (err) {
      console.error('Error getting PublicContractActivated events:', err);
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
    addNewPublicSubContract,
    activate,
    getNewPublicSubContractEvents,
    getPublicContractActivatedEvents
  };
}
