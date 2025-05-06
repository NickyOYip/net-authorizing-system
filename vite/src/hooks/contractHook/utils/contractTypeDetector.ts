import { ContractType } from '../types';

export async function detectContractType(
  id: string,
  contracts: {
    broadcast: { getContractDetails: (id: string) => Promise<any> },
    public: { getContractDetails: (id: string) => Promise<any> },
    private: { getContractDetails: (id: string) => Promise<any> }
  }
): Promise<ContractType> {
  if (!id) throw new Error('No contract ID provided');

  // Try broadcast contract
  try {
    const details = await contracts.broadcast.getContractDetails(id);
    if (details) return 'broadcast';
  } catch {}

  // Try public contract
  try {
    const details = await contracts.public.getContractDetails(id);
    if (details) return 'public';
  } catch {}

  // Try private contract
  try {
    const details = await contracts.private.getContractDetails(id);
    if (details) return 'private';
  } catch {}

  throw new Error('Contract not found or invalid contract type');
}
