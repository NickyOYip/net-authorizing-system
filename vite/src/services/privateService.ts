import { usePrivateFactory, usePrivateContract, usePrivateSubContract } from '../hooks/contractHook';

export function usePrivatePageService() {
  const factory = usePrivateFactory();
  const contract = usePrivateContract();
  const subContract = usePrivateSubContract();

  return {
    // List all contracts
    getAllPrivateContracts: factory.getAllPrivateContracts,
    // Create new contract
    createPrivateContract: factory.createPrivateContract,
    // Get contract details
    getPrivateContractDetails: contract.getContractDetails,
    // Get all versions (subcontracts)
    getAllVersions: contract.getAllVersions,
    // Get version details
    getPrivateSubContractDetails: subContract.getSubContractDetails,
    // Add new version
    addNewPrivateSubContract: contract.addNewPrivateSubContract,
    // Activate contract
    activate: contract.activate,
    // Set user (for activation)
    setUser: subContract.setUser,
    // Update data links (after user uploads encrypted files)
    updateDataLinks: subContract.updateDataLinks,
    // Verify file hash
    verifyFileHash: subContract.verifyFileHash,
  };
}
