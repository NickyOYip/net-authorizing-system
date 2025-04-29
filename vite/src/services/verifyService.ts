import { useBroadcastSubContract, usePublicSubContract, usePrivateSubContract } from '../hooks/contractHook';

export function useVerifyService() {
  const broadcastSub = useBroadcastSubContract();
  const publicSub = usePublicSubContract();
  const privateSub = usePrivateSubContract();

  // UI will decide which contract type to use
  return {
    // For broadcast
    verifyBroadcastFile: broadcastSub.verifyFileHash,
    // For public
    verifyPublicFile: publicSub.verifyFileHash,
    // For private
    verifyPrivateFile: privateSub.verifyFileHash,
  };
}
