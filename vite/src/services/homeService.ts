import { useMasterFactory } from '../hooks/contractHook';
import { useBroadcastFactory, usePublicFactory, usePrivateFactory } from '../hooks/contractHook';

export function useHomeService() {
  const masterFactory = useMasterFactory();
  const broadcastFactory = useBroadcastFactory();
  const publicFactory = usePublicFactory();
  const privateFactory = usePrivateFactory();

  // Dashboard stats: could be extended to fetch on-chain stats
  // For now, just fetch contract lists for each type
  return {
    getCurrentFactories: masterFactory.getCurrentFactories,
    getAllBroadcastContracts: broadcastFactory.getAllBroadcastContracts,
    getAllPublicContracts: publicFactory.getAllPublicContracts,
    getAllPrivateContracts: privateFactory.getAllPrivateContracts,
  };
}
