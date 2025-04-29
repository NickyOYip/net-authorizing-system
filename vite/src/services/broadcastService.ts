import { useBroadcastFactory, useBroadcastContract, useBroadcastSubContract } from '../hooks/contractHook';

export function useBroadcastPageService() {
  const factory = useBroadcastFactory();
  const contract = useBroadcastContract();
  const subContract = useBroadcastSubContract();

  return {
    // List all contracts
    getAllBroadcastContracts: factory.getAllBroadcastContracts,
    // Create new contract
    createBroadcastContract: factory.createBroadcastContract,
    // Get contract details
    getBroadcastContractDetails: contract.getContractDetails,
    // Get all versions (subcontracts)
    getAllVersions: contract.getAllVersions,
    // Get version details
    getBroadcastSubContractDetails: subContract.getSubContractDetails,
    // Add new version
    addNewBroadcastSubContract: contract.addNewBroadcastSubContract,
    // Verify file hash
    verifyFileHash: subContract.verifyFileHash,
  };
}
