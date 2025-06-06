import { ethers } from 'ethers';
import {
  MasterFactoryABI,
  BroadcastFactoryABI,
  PublicFactoryABI,
  PrivateFactoryABI,
  BroadcastContractABI,
  PublicContractABI,
  PrivateContractABI,
  BroadcastSubContractABI,
  PublicSubContractABI,
  PrivateSubContractABI
} from './abis';

/**
 * Creates a contract instance with appropriate ABI
 */
export function getContract(address, abi, provider) {
  if (!address || !ethers.isAddress(address)) {
    throw new Error(`Invalid contract address: ${address}`);
  }
  return new ethers.Contract(address, abi, provider);
}

/**
 * Gets a contract with a signer for write operations
 */
export async function getSignerContract(
  contract, 
  provider
) {
  const signer = await provider.getSigner();
  return contract.connect(signer);
}

/**
 * Get timestamp from block number
 */
export async function getTimestampFromBlockNumber(
  blockNumber,
  provider
) {
  const block = await provider.getBlock(blockNumber);
  return block ? Number(block.timestamp) : 0;
}

/**
 * Wait for transaction to be mined and return receipt
 */
export async function waitForTransaction(
  tx
) {
  const receipt = await tx.wait();
  if (!receipt) {
    throw new Error('Transaction failed');
  }
  return receipt;
}

/**
 * Find an event in transaction logs
 */
export function findEventInLogs(
  receipt,
  eventName,
  iface,
  mapper
) {
  if (!receipt.logs) return null;
  
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog({
        topics: log.topics,
        data: log.data
      });
      
      if (parsed && parsed.name === eventName) {
        return mapper(parsed.args);
      }
    } catch (e) {
      // Not the event we're looking for
      continue;
    }
  }
  
  return null;
}

/**
 * Creates contract instances based on type
 */
export function createContractFactories(provider) {
  return {
    getMasterFactoryContract: (address) => 
      getContract(address, MasterFactoryABI, provider),
      
    getBroadcastFactoryContract: (address) => 
      getContract(address, BroadcastFactoryABI, provider),
      
    getPublicFactoryContract: (address) => 
      getContract(address, PublicFactoryABI, provider),
      
    getPrivateFactoryContract: (address) => 
      getContract(address, PrivateFactoryABI, provider),
      
    getBroadcastContract: (address) => 
      getContract(address, BroadcastContractABI, provider),
      
    getPublicContract: (address) => 
      getContract(address, PublicContractABI, provider),
      
    getPrivateContract: (address) => 
      getContract(address, PrivateContractABI, provider),
      
    getBroadcastSubContract: (address) => 
      getContract(address, BroadcastSubContractABI, provider),
      
    getPublicSubContract: (address) => 
      getContract(address, PublicSubContractABI, provider),
      
    getPrivateSubContract: (address) => 
      getContract(address, PrivateSubContractABI, provider),
  };
}

/**
 * Create interface objects for all contract events
 */
export const eventInterfaces = {
  masterFactory: new ethers.Interface([
    "event NewVerContractPushed(string factoryName, uint256 verNo, address indexed masterFactoryAddr, address indexed subFactoryAddr, address indexed ownerAddr)",
    "event UsingVer(string factoryName, uint256 verNo, address indexed masterFactoryAddr, address indexed subFactoryAddr, address indexed ownerAddr)"
  ]),
  
  broadcastFactory: new ethers.Interface([
    "event NewBroadcastContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr, string title)"
  ]),
  
  publicFactory: new ethers.Interface([
    "event NewPublicContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr, string title)"
  ]),
  
  privateFactory: new ethers.Interface([
    "event NewPrivateContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr, string title)"
  ]),
  
  broadcastContract: new ethers.Interface([
    "event NewBroadcastSubContractOwned(address indexed broadcastContractAddr, address indexed subContractAddr, address indexed ownerAddr, uint256 startDate, uint256 endDate)"
  ]),
  
  publicContract: new ethers.Interface([
    "event NewPublicSubContractOwned(address indexed publicContractAddr, address indexed subContractAddr, address indexed ownerAddr, uint256 startDate, uint256 endDate)",
    "event PublicContractActivated(address indexed publicContractAddr, address indexed ownerAddr, address indexed userAddr, string title)"
  ]),
  
  privateContract: new ethers.Interface([
    "event NewPrivateSubContractOwned(address indexed privateContractAddr, address indexed subContractAddr, address indexed ownerAddr, uint256 startDate, uint256 endDate)",
    "event PrivateContractActivated(address indexed privateContractAddr, address indexed ownerAddr, address indexed userAddr, string title)"
  ]),
  
  broadcastSubContract: new ethers.Interface([
    "event StatusUpdated(address indexed subContractAddr, uint8 status)"
  ]),
  
  publicSubContract: new ethers.Interface([
    "event StatusUpdated(address indexed subContractAddr, uint8 status)"
  ]),
  
  privateSubContract: new ethers.Interface([
    "event StatusUpdated(address indexed subContractAddr, uint8 status)",
    "event DataLinksUpdated(address indexed subContractAddr, address indexed userAddr)"
  ])
};
