import { usePublicContract, usePublicSubContract, usePrivateContract, usePrivateSubContract } from '../hooks/contractHook';

export function useActivateService() {
  const publicContract = usePublicContract();
  const publicSub = usePublicSubContract();
  const privateContract = usePrivateContract();
  const privateSub = usePrivateSubContract();

  return {
    // For public contract activation
    activatePublic: publicContract.activate,
    setPublicUser: publicSub.setUser,
    verifyPublicFile: publicSub.verifyFileHash,
    // For private contract activation
    activatePrivate: privateContract.activate,
    setPrivateUser: privateSub.setUser,
    verifyPrivateFile: privateSub.verifyFileHash,
    updatePrivateDataLinks: privateSub.updateDataLinks,
  };
}
