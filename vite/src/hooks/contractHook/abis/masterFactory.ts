export const MasterFactoryABI = [
  // Functions
  "function broadcastFactoryAddrs(uint256) view returns (address)",
  "function publicFactoryAddrs(uint256) view returns (address)",
  "function privateFactoryAddrs(uint256) view returns (address)",
  "function broadcastFactoryCurrentVer() view returns (uint256)",
  "function publicFactoryCurrentVer() view returns (uint256)",
  "function privateFactoryCurrentVer() view returns (uint256)",
  "function owner() view returns (address)",
  "function getCurrentVer() view returns (address, address, address)",
  "function getAllVer() view returns (address[], address[], address[])",
  
  // Owner functions
  "function addBroadcastFactoryVer(address newFactory)",
  "function addPublicFactoryVer(address newFactory)",
  "function addPrivateFactoryVer(address newFactory)",
  "function updateBroadcastFactoryVer(uint256 verNo)",
  "function updatePublicFactoryVer(uint256 verNo)",
  "function updatePrivateFactoryVer(uint256 verNo)",

  // Events
  "event NewVerContractPushed(string factoryName, uint256 verNo, address indexed masterFactoryAddr, address indexed subFactoryAddr, address indexed ownerAddr)",
  "event UsingVer(string factoryName, uint256 verNo, address indexed masterFactoryAddr, address indexed subFactoryAddr, address indexed ownerAddr)"
];
