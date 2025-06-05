import { ContractType } from '../types';
import { ethers } from 'ethers';

export async function detectContractType(
  id,
  contracts
) {
  if (!id) throw new Error('No contract ID provided');

  // First verify contract exists
  try {
    const code = await contracts.provider.getCode(id);
    if (code === '0x') {
      throw new Error('No contract code found at address');
    }
  } catch (err) {
    throw new Error('Invalid contract address or contract not deployed');
  }

  // Try contract types in specific order with basic error handling
  try {
    await contracts.public.getContractDetails(id);
    console.log('Contract detected as public type');
    return 'public';
  } catch {}

  try {
    await contracts.private.getContractDetails(id);
    console.log('Contract detected as private type');
    return 'private';
  } catch {}

  try {
    await contracts.broadcast.getContractDetails(id);
    console.log('Contract detected as broadcast type');
    return 'broadcast';
  } catch {}

  throw new Error('Contract type could not be determined');
}
