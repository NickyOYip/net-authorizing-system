<aside>
💡

# masterFactory.sol—ver control of factory

## 🏭State Overview

| Type | Name | Description |
| --- | --- | --- |
| `address[]` | `broadcastFactoryAddrs` | addr of  `broadcastFactory` |
| `uint256` | `broadcastFactoryCurrentVer` | ver now using |
| `address[]` | `publicFactoryAddrs` | addr of  `publicFactory` |
| `uint256` | `publicFactoryCurrentVer` | ver now using |
| `address[]` | `privateFactoryAddrs` | addr of  `privateFactory` |
| `uint256` | `privateFactoryCurrentVer` | ver now using |
| `address` | `owner` | dev address |

## 🏭 Function Table

| Visibility | Function | Restriction | Description | Event |
| --- | --- | --- | --- | --- |
| `public` | `addVer({broadcast,public,private},addr newFactory)` | `only owner` | Dev can add new ver factory | `NewVerContractPushed(string FactoryName, uint256 verNo, address indexed masterFactoryAddr, address indexed subFactoryAddr, address indexed ownerAddr)` |
| `public` | `updateVer({broadcast,public,private},uint256 verNo)` | `only owner` | Dev can change the current ver factory | `UsingVer(string FactoryName, uint256 verNo, address indexed masterFactoryAddr, address indexed subFactoryAddr, address indexed ownerAddr)` |
| `public view` | `getAllVer() : broadcastFactoryAddr[] ,publicFactoryAddr[], privateFactoryAddr[]` | / | Returns the list of all deployed contract addresses. | / |
| `public view` | `getCurrentVer() : addr broadcastFactoryAddr,addr publicFactoryAddr,addr privateFactoryAddr` | / | Returns the contract address at a specific index. | / |
</aside>

<aside>
💡

# 📡broadcastFactory.sol

## 🏭 State Overview

| Type | Name | Description |
| --- | --- | --- |
| `address[]` | `broadcastContractAddrs` | List of all deployed verification contract addresses |

## 🏭 Function Table

| Visibility | Function | Restriction | Description | Event |
| --- | --- | --- | --- | --- |
| `public` | `createBroadcastContract(address userAddr) : addr CrratedBroadcastContractAddr` | / | Deploys a new broadcast contract . Emits events. | `NewBroadcastContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr,string title)`for search by owner addr |
| `public view` | `getAllBroadcastContracts() : broadcastContractAddrs[]` | / | Returns the list of all deployed contract addresses. | / |
| `public view` | `getBroadcastContractByIndex(uint256 index) : addr broadcastContractAddr` | / | Returns the contract address at a specific index. | / |

<aside>
💡

# 📡broadcastContract.sol— for open doc

## 📄State Overview

| Type | Name | Description |
| --- | --- | --- |
| `address` | `owner` | The creator or issuer of the contract |
| `string` | `title` |  |
| `uint256` | `totalVerNo` | Total number of version entries added |
| `mapping(uint256 => addr)` | `versions` | mapping of the verNo and the subContract Addr |
| `uint256` | `activeVer` | now using which ver |

## 📄 Function Table

| Visibility | Function | Restriction | Description | Event |
| --- | --- | --- | --- | --- |
| `public` | `addNewBroadcastSubContract( broadcastSubContractConstructor )` | `only owner`  | Deploys a new `broadcastSubContract`. 
update the `activeVer` to new one and `Disabled`  other
Emits events. | `NewBroadcastSubContractOwned(address indexed broadcastContractAddr, address indexed subContractAddr, address indexed ownerAddr,uint256 startDate,uint256 endDate)` for search by owner addr |
| `public view` | `getAllBroadcastSubContracts() : broadcastSubContractAddrs[]` | / | Returns the list of all deployed contract addresses. | / |
| `public view` | `getBroadcastContractByIndex(uint256 index):addr broadcastSubContractAddr` | / | Returns the contract address at a specific index. | / |

<aside>
💡

# 📡broadcastSubContract.sol

## 📄State Overview

| Type | Name | Description |
| --- | --- | --- |
| `address` | `broadcastContractAddr` |  |
| `address` | `owner` | The creator or issuer of the contract |
| `status{ Active, Disabled }` | `status` | `Active`:current one
`Disabled` : disable by owner |
| `uint256` | `version` |  |
| `string` | `jsonLink` | Link to JSON metadata (irys TxID) |
| `string` | `jsonHash` |  |
| `uint256` | `softCopyLink` | Link to a soft copy file (irys TxID) |
| `string` | `softCopyHash` |  |
| `uint256` | `startDate` | active date of this ver of cer |
| `uint256` | `endDate` | end date of this ver of cer |
| `uint256` | `deployTime` | deploy time of this ver of contract |

## 📄 Function Table

| Visibility | Function | Restriction | Description | Event |
| --- | --- | --- | --- | --- |
| `public` | `updateStatus(status { Active, Disabled })` | `only owner` or `only parent` | Returns the contract address at a specific index. | `NewBroadcastContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr)` |
| `public view` | `getDetail() : allState`  | / | Returns all State of this ver | / |
</aside>

📡

</aside>

</aside>

<aside>
💡

# 🌐 publicFactory.sol

## 🏭 State Overview

| Type | Name | Description |
| --- | --- | --- |
| `address[]` | `publicContractAddrs` | List of all deployed verification contract addresses |

## 🏭 Function Table

| Visibility | Function | Restriction | Description | Event |
| --- | --- | --- | --- | --- |
| `public` | `createPublicContract(address userAddr) : addr CrratedPublicContractAddr` | / | Deploys a new broadcast contract . Emits events. | `NewPublicContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr,string title)`for search by owner addr |
| `public view` | `getAllPublicContracts() : publicContractAddrs[]` | / | Returns the list of all deployed contract addresses. | / |
| `public view` | `getPublicContractByIndex(uint256 index) : addr publicContractAddr` | / | Returns the contract address at a specific index. | / |

<aside>
💡

# 🌐 publicContract.sol— for open doc

## 📄State Overview

| Type | Name | Description |
| --- | --- | --- |
| `address` | `owner` | The creator or issuer of the contract |
| `address` | `user` | is null before user activate it |
| `string` | `title` |  |
| `uint256` | `totalVerNo` | Total number of version entries added |
| `mapping(uint256 => addr)` | `versions` | mapping of the verNo and the subContract Addr |
| `uint256` | `activeVer` | now using which ver |
| `uint256` | `activationCodeHash` | verf the user activation code |

## 📄 Function Table

| Visibility | Function | Restriction | Description | Event |
| --- | --- | --- | --- | --- |
| `public` | `addNewPublicSubContract( publicSubContractConstructor )` | `only owner`  | Deploys a new `publicSubContract`. 
update the `activeVer` to new one and `Disabled`  other
Emits events. | `NewPublicSubContractOwned(address indexed publicContractAddr, address indexed subContractAddr, address indexed ownerAddr, uint256 startDate,uint256 endDate)` for search by owner addr |
| `public` | `activate(uint256  activationCode)` | / | after activate the user addr → message sender addr | `PublicContractActivaded(address indexed publicContractAddr, address indexed ownerAddr, address indexed userAddr,string title)` |
| `public view` | `getAllPublicSubContracts() : publicSubContractAddrs[]` | / | Returns the list of all deployed contract addresses. | / |
| `public view` | `getPublicContractByIndex(uint256 index):addr publicSubContractAddr` | / | Returns the contract address at a specific index. | / |

<aside>
💡

# 🌐 publicSubContract.sol

## 📄State Overview

| Type | Name | Description |
| --- | --- | --- |
| `address` | `publicContractAddr` |  |
| `address` | `owner` | The creator or issuer of the contract |
| `address` | `parent` | publicContract addr |
| `address` | `user` |  |
| `status{ Active, Disabled }` | `status` | `Active`:current one
`Disabled` : disable by owner |
| `uint256` | `version` |  |
| `string` | `jsonLink` | Link to JSON metadata (irys TxID) |
| `string` | `jsonHash` |  |
| `uint256` | `softCopyLink` | Link to a soft copy file (irys TxID) |
| `string` | `softCopyHash` |  |
| `uint256` | `startDate` | active date of this ver of cer |
| `uint256` | `endDate` | end date of this ver of cer |
| `uint256` | `deployTime` | deploy time of this ver of contract |

## 📄 Function Table

| Visibility | Function | Restriction | Description | Event |
| --- | --- | --- | --- | --- |
| `public` | `updateStatus(status { Active, Disabled })` | `only owner` or `only parent` | Returns the contract address at a specific index. | `NewBroadcastContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr)` |
| `public view` | `getDetail() : allState`  | / | Returns all State of this ver | / |
</aside>

</aside>

</aside>

<aside>
💡

# 🔒 privateFactory.sol

## 🏭 State Overview

| Type | Name | Description |
| --- | --- | --- |
| `address[]` | `privateContractAddrs` | List of all deployed verification contract addresses |

## 🏭 Function Table

| Visibility | Function | Restriction | Description | Event |
| --- | --- | --- | --- | --- |
| `public` | `createPrivateContract(address userAddr) : addr CrratedPrivateContractAddr` | / | Deploys a new broadcast contract . Emits events. | `NewPrivateContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr,string title)`for search by owner addr |
| `public view` | `getAllPrivateContracts() : publicCrivateAddrs[]` | / | Returns the list of all deployed contract addresses. | / |
| `public view` | `getPrivateContractByIndex(uint256 index) : addr privateContractAddr` | / | Returns the contract address at a specific index. | / |

<aside>
💡

# 🔒 privateContract.sol— for open doc

## 📄State Overview

| Type | Name | Description |
| --- | --- | --- |
| `address` | `owner` | The creator or issuer of the contract |
| `address` | `user` | is null before user activate it |
| `string` | `title` |  |
| `uint256` | `totalVerNo` | Total number of version entries added |
| `mapping(uint256 => addr)` | `versions` | mapping of the verNo and the subContract Addr |
| `uint256` | `activeVer` | now using which ver |
| `uint256` | `activationCodeHash` | verf the user activation code |

## 📄 Function Table

| Visibility | Function | Restriction | Description | Event |
| --- | --- | --- | --- | --- |
| `public` | `addNewPrivateSubContract( publicSubContractConstructor )` | `only owner`  | Deploys a new `privateSubContract`. 
update the `activeVer` to new one and `Disabled`  other
Emits events. | `NewPrivateSubContractOwned(address indexed privateContractAddr, address indexed subContractAddr, address indexed ownerAddr, uint256 startDate,uint256 endDate)` for search by owner addr |
| `public` | `activate(uint256  activationCode)` | / | after activate the user addr → message sender addr | `PrivateContractActivaded(address indexed privateContractAddr, address indexed ownerAddr, address indexed userAddr,string title)` |
| `public view` | `getAllPrivateSubContracts() : privateSubContractAddrs[]` | / | Returns the list of all deployed contract addresses. | / |
| `public view` | `getPrivateContractByIndex(uint256 index):addr privateSubContractAddr` | / | Returns the contract address at a specific index. | / |

<aside>
💡

# 🔒 privateSubContract.sol

## 📄State Overview

| Type | Name | Description |
| --- | --- | --- |
| `address` | `privateContractAddr` |  |
| `address` | `owner` | The creator or issuer of the contract |
| `address` | `parent` | publicContract addr |
| `address` | `user` |  |
| `status{ Active, Disabled }` | `status` | `Active`:current one
`Disabled` : disable by owner |
| `uint256` | `version` |  |
| `string` | `jsonLink` | Link to JSON metadata (irys TxID) is null before user input data(encrypted by frontend) |
| `string` | `jsonHash` |  |
| `uint256` | `softCopyLink` | Link to a soft copy file (irys TxID) is null before user input data(encrypted by frontend) |
| `string` | `softCopyHash` |  |
| `uint256` | `startDate` | active date of this ver of cer |
| `uint256` | `endDate` | end date of this ver of cer |
| `uint256` | `deployTime` | deploy time of this ver of contract |

## 📄 Function Table

| Visibility | Function | Restriction | Description | Event |
| --- | --- | --- | --- | --- |
| `public` | `updateStatus(status { Active, Disabled })` | `only owner` or `only parent` | Returns the contract address at a specific index. | `NewPrivateContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr)` |
| `public view` | `getDetail() : allState`  | / | Returns all State of this ver | / |
</aside>

</aside>

</aside>