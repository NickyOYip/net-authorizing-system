// ABIs for the contracts - simplified versions that include necessary functions and events

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

export const BroadcastFactoryABI = [
  // Functions
  "function createBroadcastContract(string title) returns (address)",
  "function getAllBroadcastContracts() view returns (address[])",
  "function getBroadcastContractByIndex(uint256 index) view returns (address)",

  // Events
  "event NewBroadcastContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr, string title)"
];

export const PublicFactoryABI = [
  // Functions
  "function createPublicContract(string title, string activationCode) returns (address)",
  "function getAllPublicContracts() view returns (address[])",
  "function getPublicContractByIndex(uint256 index) view returns (address)",

  // Events
  "event NewPublicContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr, string title)"
];

export const PrivateFactoryABI = [
  // Functions
  "function createPrivateContract(string title, string activationCode) returns (address)",
  "function getAllPrivateContracts() view returns (address[])",
  "function getPrivateContractByIndex(uint256 index) view returns (address)",

  // Events
  "event NewPrivateContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr, string title)"
];

export const BroadcastContractABI = [
  // Functions
  "function owner() view returns (address)",
  "function title() view returns (string)",
  "function totalVerNo() view returns (uint256)",
  "function versions(uint256) view returns (address)",
  "function activeVer() view returns (uint256)",
  "function addNewBroadcastSubContract(string jsonHash, string softCopyHash, string storageLink, uint256 startDate, uint256 endDate) returns (address)",
  "function getAllBroadcastSubContracts() view returns (address[])",
  "function getBroadcastContractByIndex(uint256 index) view returns (address)",
  "function getCurrentVersion() view returns (address)",

  // Events
  "event NewBroadcastSubContractOwned(address indexed broadcastContractAddr, address indexed subContractAddr, address indexed ownerAddr, uint256 startDate, uint256 endDate)"
];

export const PublicContractABI = [
  // Functions
  "function owner() view returns (address)",
  "function user() view returns (address)",
  "function title() view returns (string)",
  "function totalVerNo() view returns (uint256)",
  "function versions(uint256) view returns (address)",
  "function activeVer() view returns (uint256)",
  "function activationCodeHash() view returns (bytes32)",
  "function addNewPublicSubContract(string jsonHash, string softCopyHash, string storageLink, uint256 startDate, uint256 endDate) returns (address)",
  "function activate(string activationCode)",
  "function getAllPublicSubContracts() view returns (address[])",
  "function getPublicContractByIndex(uint256 index) view returns (address)",
  "function getCurrentVersion() view returns (address)",

  // Events
  "event NewPublicSubContractOwned(address indexed publicContractAddr, address indexed subContractAddr, address indexed ownerAddr, uint256 startDate, uint256 endDate)",
  "event PublicContractActivated(address indexed publicContractAddr, address indexed ownerAddr, address indexed userAddr, string title)"
];

export const PrivateContractABI = [
  // Functions
  "function owner() view returns (address)",
  "function user() view returns (address)",
  "function title() view returns (string)",
  "function totalVerNo() view returns (uint256)",
  "function versions(uint256) view returns (address)",
  "function activeVer() view returns (uint256)",
  "function activationCodeHash() view returns (bytes32)",
  "function addNewPrivateSubContract(string jsonHash, string softCopyHash, uint256 startDate, uint256 endDate) returns (address)",
  "function activate(string activationCode)",
  "function getAllPrivateSubContracts() view returns (address[])",
  "function getPrivateContractByIndex(uint256 index) view returns (address)",
  "function getCurrentVersion() view returns (address)",

  // Events
  "event NewPrivateSubContractOwned(address indexed privateContractAddr, address indexed subContractAddr, address indexed ownerAddr, uint256 startDate, uint256 endDate)",
  "event PrivateContractActivated(address indexed privateContractAddr, address indexed ownerAddr, address indexed userAddr, string title)"
];

export const BroadcastSubContractABI = [
  // Functions
  "function broadcastContractAddr() view returns (address)",
  "function owner() view returns (address)",
  "function status() view returns (uint8)",
  "function version() view returns (uint256)",
  "function jsonHash() view returns (string)",
  "function softCopyHash() view returns (string)",
  "function storageLink() view returns (string)",
  "function startDate() view returns (uint256)",
  "function endDate() view returns (uint256)",
  "function deployTime() view returns (uint256)",
  "function updateStatus(uint8 _status)",
  "function getDetail() view returns (address, address, uint8, uint256, string, string, string, uint256, uint256, uint256)",

  // Events
  "event StatusUpdated(address indexed subContractAddr, uint8 status)"
];

export const PublicSubContractABI = [
  // Functions
  "function publicContractAddr() view returns (address)",
  "function owner() view returns (address)",
  "function parent() view returns (address)",
  "function user() view returns (address)",
  "function status() view returns (uint8)",
  "function version() view returns (uint256)",
  "function jsonHash() view returns (string)",
  "function softCopyHash() view returns (string)",
  "function storageLink() view returns (string)",
  "function startDate() view returns (uint256)",
  "function endDate() view returns (uint256)",
  "function deployTime() view returns (uint256)",
  "function updateStatus(uint8 _status)",
  "function setUser(address _user)",
  "function getDetail() view returns (address, address, address, address, uint8, uint256, string, string, string, uint256, uint256, uint256)",

  // Events
  "event StatusUpdated(address indexed subContractAddr, uint8 status)"
];

export const PrivateSubContractABI = [
  // Functions
  "function privateContractAddr() view returns (address)",
  "function owner() view returns (address)",
  "function parent() view returns (address)",
  "function user() view returns (address)",
  "function status() view returns (uint8)",
  "function version() view returns (uint256)",
  "function jsonHash() view returns (string)",
  "function softCopyHash() view returns (string)",
  "function jsonLink() view returns (string)",
  "function softCopyLink() view returns (string)",
  "function startDate() view returns (uint256)",
  "function endDate() view returns (uint256)",
  "function deployTime() view returns (uint256)",
  "function updateStatus(uint8 _status)",
  "function setUser(address _user)",
  "function updateDataLinks(string _jsonLink, string _softCopyLink)",
  "function getDetail() view returns (address, address, address, address, uint8, uint256, string, string, string, string, uint256, uint256, uint256)",

  // Events
  "event StatusUpdated(address indexed subContractAddr, uint8 status)",
  "event DataLinksUpdated(address indexed subContractAddr, address indexed userAddr)"
];
