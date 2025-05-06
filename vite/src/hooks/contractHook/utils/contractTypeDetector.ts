import { ContractType } from '../types';
import { ethers } from 'ethers';

// Helper function to safely query events in chunks
async function queryEventsInChunks(
  getEvents: (from: number, to: number) => Promise<any[]>,
  provider: ethers.Provider
): Promise<any[]> {
  try {
    const currentBlock = await provider.getBlockNumber();
    const CHUNK_SIZE = 40000; // Slightly less than limit to be safe
    const START_BLOCK = Math.max(0, currentBlock - CHUNK_SIZE); // Only check recent blocks

    return await getEvents(START_BLOCK, currentBlock);
  } catch (err) {
    console.warn('Error querying events:', err);
    return [];
  }
}

export async function detectContractType(
  id: string,
  contracts: {
    broadcast: { getNewBroadcastSubContractEvents: (addr: string, from?: number, to?: number) => Promise<any[]> },
    public: { getNewPublicSubContractEvents: (addr: string, from?: number, to?: number) => Promise<any[]> },
    private: { getNewPrivateSubContractEvents: (addr: string, from?: number, to?: number) => Promise<any[]> },
    provider: ethers.Provider
  }
): Promise<ContractType> {
  if (!id) throw new Error('No contract ID provided');

  try {
    // First try to get contract details directly
    try {
      const code = await contracts.provider.getCode(id);
      if (code === '0x') {
        throw new Error('No contract code found at address');
      }
    } catch (err) {
      throw new Error('Invalid contract address or contract not deployed');
    }

    // Try each contract type with chunked event queries
    const typesAndEvents: [ContractType, (from: number, to: number) => Promise<any[]>][] = [
      ['broadcast', (from, to) => contracts.broadcast.getNewBroadcastSubContractEvents(id, from, to)],
      ['public', (from, to) => contracts.public.getNewPublicSubContractEvents(id, from, to)],
      ['private', (from, to) => contracts.private.getNewPrivateSubContractEvents(id, from, to)]
    ];

    for (const [type, getEvents] of typesAndEvents) {
      try {
        const events = await queryEventsInChunks(getEvents, contracts.provider);
        if (events.length > 0) {
          console.log(`Contract detected as ${type} type through events`);
          return type;
        }
      } catch (err) {
        console.warn(`Failed to verify ${type} type:`, err);
        continue;
      }
    }

    throw new Error('Contract type could not be determined');
  } catch (err) {
    throw new Error(`Contract not found or invalid contract type: ${err.message}`);
  }
}
