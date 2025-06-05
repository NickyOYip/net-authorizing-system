import { ethers } from 'ethers';
import { BroadcastFactoryABI } from '../hooks/contractHook/abis/broadcastFactory';
import { PublicFactoryABI } from '../hooks/contractHook/abis/publicFactory';
import { PrivateFactoryABI } from '../hooks/contractHook/abis/privateFactory';

// Debug: RPC provider to fetch events directly
const debugProvider = new ethers.JsonRpcProvider('https://ethereum-hoodi-rpc.publicnode.com');

/**
 * Determines the type of a contract based on its address by checking
 * if it was deployed from any of the factory contracts
 * 
 * @param contractAddress The address of the contract to check
 * @param factoryAddresses Object containing addresses of all factory contracts
 * @param provider Optional Ethereum provider/signer to use
 * @returns The contract type or 'unknown' if not determined
 */
export async function getContractType(
  contractAddress, 
  factoryAddresses,
  provider
){
  // Use provided provider or fallback to debug provider
  const ethProvider = provider || debugProvider;
  
  // Check each factory type
  const isBroadcast = await isContractFromFactory(
    contractAddress,
    factoryAddresses.broadcast,
    BroadcastFactoryABI,
    'NewBroadcastContractOwned',
    ethProvider
  );
  if (isBroadcast) return 'broadcast';
  
  const isPublic = await isContractFromFactory(
    contractAddress,
    factoryAddresses.public,
    PublicFactoryABI,
    'NewPublicContractOwned',
    ethProvider
  );
  if (isPublic) return 'public';
  
  const isPrivate = await isContractFromFactory(
    contractAddress,
    factoryAddresses.private,
    PrivateFactoryABI,
    'NewPrivateContractOwned',
    ethProvider
  );
  if (isPrivate) return 'private';

  return 'unknown';
}

/**
 * Checks if a contract was deployed from a specific factory
 * by querying past events
 */
async function isContractFromFactory(
  contractAddress,
  factoryAddress,
  factoryABI,
  eventName,
  provider
) {
  if (!factoryAddress) return false;
  
  try {
    // Create contract instance with the factory
    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, provider);
    
    // Look for events where contractAddr matches our contract
    const filter = factoryContract.filters[eventName](null, contractAddress);
    
    // Use batch query to avoid timeout with large block ranges
    const events = await batchQueryFilter(factoryContract, filter);
    
    // If any events found, this contract was deployed from this factory
    return events.length > 0;
  } catch (error) {
    console.error(`Error checking if contract came from factory:`, error);
    return false;
  }
}

/**
 * Batch contract.queryFilter in ≤40 k‐block chunks
 */
async function batchQueryFilter(
  contract,
  eventFilter,
  step = 40000,
  startBlock = 0
) {
  const provider = contract.provider || debugProvider;
  const latest = await provider.getBlockNumber();
  let allEvents = [];
  // ensure a read‐only contract backed by the provider
  const reader = contract.connect(provider);
  for (let from = startBlock; from <= latest; from += step) {
    const to = Math.min(from + step - 1, latest);
    console.log(`[contractUtils][debug] batchQueryFilter ${contract.address} from ${from}→${to}`);
    const evs = await reader.queryFilter(eventFilter, from, to);
    allEvents.push(...(evs || []));
  }
  return allEvents;
}

/**
 * Get contract type with caching for better performance
 * Stores previously detected types in memory
 */
const contractTypeCache = new Map();

export async function getCachedContractType(
  contractAddress,
  factoryAddresses,
  provider
) {
  const lowerCaseAddr = contractAddress.toLowerCase();
  
  // Return from cache if available
  if (contractTypeCache.has(lowerCaseAddr)) {
    return contractTypeCache.get(lowerCaseAddr) || 'unknown';
  }
  
  // Otherwise get the contract type and cache it
  const contractType = await getContractType(lowerCaseAddr, factoryAddresses, provider);
  contractTypeCache.set(lowerCaseAddr, contractType);
  return contractType;
}
