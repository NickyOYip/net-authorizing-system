import { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { 
  useMasterFactory, 
} from '../hooks/contractHook';
import { BroadcastFactoryABI } from '../hooks/contractHook/abis/broadcastFactory';
import { PublicFactoryABI }    from '../hooks/contractHook/abis/publicFactory';
import { PrivateFactoryABI }   from '../hooks/contractHook/abis/privateFactory';
import { DataContext } from '../provider/dataProvider';
import { getCachedContractType} from '../utils/contractUtils';

// Debug: RPC provider to fetch events directly
const debugProvider = new ethers.JsonRpcProvider('https://ethereum-hoodi-rpc.publicnode.com');

/** 
 * ownerAddr: user address 
 * factoryAddrs: [broadcastFactoryAddr, publicFactoryAddr, privateFactoryAddr] 
 */
async function fetchUserEvents(ownerAddr, factoryAddrs) {
  console.log('[homeService][debug] fetchUserEvents()', { ownerAddr, factoryAddrs });
  const eventSignature = 'NewBroadcastContractOwned(address,address,address,string)';
  const topic0 = ethers.id(eventSignature);
  // pad owner address to 32 bytes for topic filter (manual)
  const topic2 = '0x' + ownerAddr.toLowerCase().replace(/^0x/, '').padStart(64, '0');

  try {
    const latest = await debugProvider.getBlockNumber();
    const fromBlock = 25000;
    const toBlock = Math.min(latest, 50000);
    let allLogs = [];

    for (const factoryAddr of factoryAddrs) {
      if (!factoryAddr) continue;
      console.log(`[homeService][debug] ${factoryAddr} logs from ${fromBlock}→${toBlock}`);
      const logs = await debugProvider.getLogs({
        address: factoryAddr,
        fromBlock,
        toBlock,
        topics: [topic0, null, null, topic2],
      });
      allLogs = logs;
    }

    console.log('[homeService][debug] direct logs:', allLogs);
  } catch (error) {
    console.error('[homeService][debug] fetchUserEvents error:', error);
  }
}

// Batch contract.queryFilter in ≤40 k‐block chunks,
// using debugProvider if contract.provider is missing
async function batchQueryFilter(
  contract,
  eventFilter,
  step = 50000,
  startBlock = 0
) {
  const provider = contract.provider || debugProvider;
  const latest = await provider.getBlockNumber();
  let allEvents = [];
  // ensure a read‐only contract backed by the provider
  const reader = contract.connect(provider);
  
  // Debug the contract address - added for debuggings
  console.log(`[homeService][debug] Using contract:`, {
    address: contract.address,
    hasProvider: !!contract.provider
  });
  
  for (let from = startBlock; from <= latest; from += step) {
    const to = Math.min(from + step - 1, latest);
    console.log(`[homeService][debug] batchQueryFilter ${contract.address} from ${from}→${to}`);
    const evs = await reader.queryFilter(eventFilter, from, to);
    allEvents.push(...(evs || []));
  }
  return allEvents;
}

export function useHomeService() {
  const { data } = useContext(DataContext);
  const masterFactory = useMasterFactory();

  const isConnected = !!data.ethProvider;

  // Search contracts by address using events
  const searchContracts = async (searchTerm) => {
    console.log('[homeService] ➡️ searchContracts()', { searchTerm, isConnected });
    
    if (!searchTerm) return [];
    
    if (!isConnected) {
      return [];
    }

    try {
      const searchAddress = searchTerm.toLowerCase();
      console.log('[homeService]  normalized address:', searchAddress);

      // Get contract addresses directly from DataContext
      const bfAddr = data.broadcastFactory.address;
      const pfAddr = data.publicFactory.address;
      const prfAddr = data.privateFactory.address;
      
      // Log factory addresses
      console.log('[homeService]  factory addresses:', {
        broadcastFactory: bfAddr,
        publicFactory: pfAddr,
        privateFactory: prfAddr
      });

      // Check if we have valid factory addresses
      if (!bfAddr && !pfAddr && !prfAddr) {
        console.error('[homeService] No factory addresses available!');
        return [];
      }

      // Create contract instances only if addresses exist
      const signer = await data.ethProvider.getSigner();
      const broadcastFactory = bfAddr ? new ethers.Contract(bfAddr, BroadcastFactoryABI, signer) : null;
      const publicFactory = pfAddr ? new ethers.Contract(pfAddr, PublicFactoryABI, signer) : null;
      const privateFactory = prfAddr ? new ethers.Contract(prfAddr, PrivateFactoryABI, signer) : null;

      // Make search term less strict - search for partial matches
      // (only if it's not a full Ethereum address)
      let searchFilter;
      if (searchAddress.length === 42) { // Full Ethereum address
        // Use exact match if it's a complete address
        searchFilter = (contractAddr, ownerAddr) => 
          contractAddr === searchAddress || ownerAddr === searchAddress;
      } else {
        // Use contains match for partial searches
        searchFilter = (contractAddr, ownerAddr) => 
          contractAddr.includes(searchAddress) || ownerAddr.includes(searchAddress);
      }

      // Fetch all recent contracts first, then filter by search term
      console.log('[homeService] Fetching all recent contracts to search through');
      const [broadcastEvents, publicEvents, privateEvents] = await Promise.all([
        broadcastFactory
          ? batchQueryFilter(
              broadcastFactory,
              broadcastFactory.filters.NewBroadcastContractOwned()
            )
          : [],
        publicFactory
          ? batchQueryFilter(
              publicFactory,
              publicFactory.filters.NewPublicContractOwned()
            )
          : [],
        privateFactory
          ? batchQueryFilter(
              privateFactory,
              privateFactory.filters.NewPrivateContractOwned()
            )
          : []
      ]);

      console.log('[homeService] Total contracts fetched:', {
        broadcast: broadcastEvents.length,
        public: publicEvents.length, 
        private: privateEvents.length
      });

      // Filter contracts by search term
      const filteredBroadcast = broadcastEvents.filter(event => 
        searchFilter(event.args.contractAddr.toLowerCase(), event.args.ownerAddr.toLowerCase())
      );
      
      const filteredPublic = publicEvents.filter(event => 
        searchFilter(event.args.contractAddr.toLowerCase(), event.args.ownerAddr.toLowerCase())
      );
      
      const filteredPrivate = privateEvents.filter(event => 
        searchFilter(event.args.contractAddr.toLowerCase(), event.args.ownerAddr.toLowerCase())
      );

      console.log('[homeService] Filtered contracts:', {
        broadcast: filteredBroadcast.length,
        public: filteredPublic.length,
        private: filteredPrivate.length
      });

      // Transform events to contract objects
      const contracts = [
        ...(filteredBroadcast.map(event => ({
          type: 'broadcast',
          address: event.args.contractAddr,
          owner: event.args.ownerAddr,
          title: event.args.title
        })) || []),
        ...(filteredPublic.map(event => ({
          type: 'public',
          address: event.args.contractAddr,
          owner: event.args.ownerAddr,
          title: event.args.title
        })) || []),
        ...(filteredPrivate.map(event => ({
          type: 'private',
          address: event.args.contractAddr,
          owner: event.args.ownerAddr,
          title: event.args.title
        })) || []),
      ];
      console.log('[homeService]  mapped contracts:', contracts);

      return contracts;
    } catch (error) {
      console.error('[homeService] ❌ searchContracts error:', error);
      return [];
    }
  };

  // Get contracts related to the current user using events
  const getUserRelatedContracts = async () => {
    console.log('[homeService] ➡️ getUserRelatedContracts()', { isConnected });

    if (!isConnected) {
      return [];
    }

    // 1) pull the on-chain factory addrs from masterFactory
    const { broadcast: bfAddr, public: pfAddr, private: prfAddr } =
      await getCurrentFactories();

    // 2) build real ethers.Contract instances with ABI + signer
    const signer = await data.ethProvider.getSigner();
    const bf = bfAddr  ? new ethers.Contract(bfAddr,  BroadcastFactoryABI, signer) : null;
    const pf = pfAddr  ? new ethers.Contract(pfAddr,  PublicFactoryABI,    signer) : null;
    const pr = prfAddr ? new ethers.Contract(prfAddr, PrivateFactoryABI,   signer) : null;

    try {
      const userAddress = await signer.getAddress();
      console.log('[homeService]  userAddress:', userAddress);

      // pass the factory addresses into the logger
      await fetchUserEvents(userAddress, [bfAddr, pfAddr, prfAddr]);

      // 3) batch‐fetch events instead of a single wide queryFilter
      const [broadcastEvents, publicEvents, privateEvents] = await Promise.all([
        bf
          ? batchQueryFilter(
              bf,
              bf.filters.NewBroadcastContractOwned(null, null, userAddress, null)
            )
          : [],
        pf
          ? batchQueryFilter(
              pf,
              pf.filters.NewPublicContractOwned(null, null, userAddress, null)
            )
          : [],
        pr
          ? batchQueryFilter(
              pr,
              pr.filters.NewPrivateContractOwned(null, null, userAddress, null)
            )
          : [],
      ]);

      console.log('[homeService]  raw user events:', { broadcastEvents, publicEvents, privateEvents });

      // Transform events to contract objects
      const contracts = [
        ...(broadcastEvents?.map(event => ({
          type: 'broadcast',
          address: event.args.contractAddr,
          owner: event.args.ownerAddr,
          title: event.args.title
        })) || []),
        ...(publicEvents?.map(event => ({
          type: 'public',
          address: event.args.contractAddr,
          owner: event.args.ownerAddr,
          title: event.args.title
        })) || []),
        ...(privateEvents?.map(event => ({
          type: 'private',
          address: event.args.contractAddr,
          owner: event.args.ownerAddr,
          title: event.args.title
        })) || []),
      ];
      console.log('[homeService]  mapped user contracts:', contracts);

      return contracts;
    } catch (error) {
      console.error('[homeService] ❌ getUserRelatedContracts error:', error);
      return [];
    }
  };

  // Get current factory addresses from DataContext instead of masterFactory
  const getCurrentFactories = async () => {
    return {
      broadcast: data.broadcastFactory.address,
      public:    data.publicFactory.address,
      private:   data.privateFactory.address,
    };
  };
  
  // Determine contract type from address (new method)
  const getContractTypeFromAddress = async (address) => {
    const factories = await getCurrentFactories();
    return getCachedContractType(address, factories, data.ethProvider);
  };

  return {
    searchContracts,
    getUserRelatedContracts,
    getCurrentFactories,
    getContractTypeFromAddress, // Export the new function
  };
}
