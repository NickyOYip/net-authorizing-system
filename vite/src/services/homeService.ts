import { useState, useEffect, useContext } from 'react';
import { 
  useMasterFactory, 
  useBroadcastFactory, 
  usePublicFactory, 
  usePrivateFactory 
} from '../hooks/contractHook';
import { DataContext } from '../provider/dataProvider';
import { mockContracts } from '../mockHelpers';

export function useHomeService() {
  const { data } = useContext(DataContext);
  const masterFactory = useMasterFactory();
  const broadcastFactory = useBroadcastFactory();
  const publicFactory = usePublicFactory();
  const privateFactory = usePrivateFactory();

  // Return null if wallet not connected, else use the hooks
  const isConnected = !!data.ethProvider;

  // Get all contracts from respective factories
  const getAllBroadcastContracts = async () => {
    // For now, return mock data when disconnected
    if (!isConnected) return mockContracts.filter(c => c.type === 'broadcast');
    try {
      const contracts = await broadcastFactory?.getAllBroadcastContracts?.();
      return contracts || [];
    } catch (error) {
      console.error("Error getting broadcast contracts:", error);
      return []; // Return empty array instead of throwing
    }
  };

  const getAllPublicContracts = async () => {
    // For now, return mock data when disconnected
    if (!isConnected) return mockContracts.filter(c => c.type === 'public');
    try {
      const contracts = await publicFactory?.getAllPublicContracts?.();
      return contracts || [];
    } catch (error) {
      console.error("Error getting public contracts:", error);
      return []; // Return empty array instead of throwing
    }
  };

  const getAllPrivateContracts = async () => {
    // For now, return mock data when disconnected
    if (!isConnected) return mockContracts.filter(c => c.type === 'private');
    try {
      const contracts = await privateFactory?.getAllPrivateContracts?.();
      return contracts || [];
    } catch (error) {
      console.error("Error getting private contracts:", error);
      return []; // Return empty array instead of throwing
    }
  };

  // Search contracts by address, owner, or user
  const searchContracts = async (searchTerm) => {
    if (!searchTerm) return [];
    
    // If not connected, search mock data
    if (!isConnected) {
      return mockContracts.filter(c => 
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.recipient && c.recipient.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    try {
      // Search events from contract hooks safely with proper error handling
      let broadcastResults = [];
      let publicResults = [];  
      let privateResults = [];
      
      try {
        broadcastResults = await broadcastFactory?.getNewBroadcastContractEvents?.(searchTerm) || [];
      } catch (e) {
        console.warn("Error fetching broadcast contracts:", e);
      }
      
      try {
        publicResults = await publicFactory?.getNewPublicContractEvents?.(searchTerm) || [];
      } catch (e) {
        console.warn("Error fetching public contracts:", e);
      }
      
      try {
        privateResults = await privateFactory?.getNewPrivateContractEvents?.(searchTerm) || [];
      } catch (e) {
        console.warn("Error fetching private contracts:", e);
      }

      // Transform event results to contract objects
      // This might need customization based on your contract event structure
      return [...broadcastResults, ...publicResults, ...privateResults];
    } catch (error) {
      console.error("Error searching contracts:", error);
      return []; // Return empty array instead of throwing
    }
  };

  // Get contracts related to the current user (owner or recipient)
  const getUserRelatedContracts = async () => {
    if (!isConnected) {
      // Return all contracts for now (in real app, filter by user address)
      return mockContracts;
    }

    try {
      // Get user address
      const signer = await data.ethProvider.getSigner();
      const address = await signer.getAddress();

      // Get contracts where user is owner or recipient with proper error handling
      let broadcastContracts = [];
      let publicContracts = [];
      let privateContracts = [];
      
      try {
        broadcastContracts = await getAllBroadcastContracts() || [];
      } catch (e) {
        console.warn("Error fetching user broadcast contracts:", e);
      }
      
      try {
        publicContracts = await getAllPublicContracts() || [];
      } catch (e) {
        console.warn("Error fetching user public contracts:", e);
      }
      
      try {
        privateContracts = await getAllPrivateContracts() || [];
      } catch (e) {
        console.warn("Error fetching user private contracts:", e);
      }

      // Filter contracts owned by user or where user is recipient
      // This filtering might need to be done differently based on your contract structure
      const userContracts = [
        ...broadcastContracts,
        ...publicContracts,
        ...privateContracts
      ].filter(contract => 
        contract && (
          contract.owner === address || 
          contract.recipient === address
        )
      );

      return userContracts;
    } catch (error) {
      console.error("Error getting user-related contracts:", error);
      return []; // Return empty array instead of throwing
    }
  };

  // Get current factory addresses from master factory
  const getCurrentFactories = async () => {
    if (!isConnected) return { 
      broadcast: null, 
      public: null, 
      private: null 
    };
    
    try {
      const factories = await masterFactory?.getCurrentFactories?.() || {
        broadcastFactory: null,
        publicFactory: null,
        privateFactory: null
      };
      
      return {
        broadcast: factories.broadcastFactory,
        public: factories.publicFactory,
        private: factories.privateFactory
      };
    } catch (error) {
      console.error("Error getting current factories:", error);
      return { 
        broadcast: null, 
        public: null, 
        private: null 
      };
    }
  };

  return {
    getAllBroadcastContracts,
    getAllPublicContracts,
    getAllPrivateContracts,
    searchContracts,
    getUserRelatedContracts,
    getCurrentFactories,
  };
}
