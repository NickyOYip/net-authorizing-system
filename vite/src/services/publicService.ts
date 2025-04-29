import { usePublicFactory, usePublicContract, usePublicSubContract } from '../hooks/contractHook';

export function usePublicPageService() {
  const factory = usePublicFactory();
  const contract = usePublicContract();
  const subContract = usePublicSubContract();

  return {
    // List all contracts
    getAllPublicContracts: factory.getAllPublicContracts,
    // Create new contract
    createPublicContract: factory.createPublicContract,
    // Get contract details
    getPublicContractDetails: contract.getContractDetails,
    // Get all versions (subcontracts)
    getAllVersions: contract.getAllVersions,
    // Get version details
    getPublicSubContractDetails: subContract.getSubContractDetails,
    // Add new version
    addNewPublicSubContract: contract.addNewPublicSubContract,
    // Activate contract
    activate: contract.activate,
    // Set user (for activation)
    setUser: subContract.setUser,
    // Verify file hash
    verifyFileHash: subContract.verifyFileHash,
  };
}
