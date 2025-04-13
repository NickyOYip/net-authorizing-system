# Net Authorizing System - Smart Contract Deployment

This directory contains the smart contracts and deployment scripts for the Net Authorizing System.

## Prerequisites

- Node.js (v14+)
- npm or yarn
- Hardhat

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your credentials:
   ```
   PRIVATE_KEY= your_private_key_without_0x_prefix
   SEPOLIA_RPC_URL = https://eth-sepolia.public.blastapi.io
   ETHERSCAN_API_KEY= your_etherscan_api_key
   REPORT_GAS=true
   ```

## Deployment

### Local Deployment

For testing in a local Hardhat node:

1. Start a local node:
   ```bash
   npx hardhat node
   ```

2. Deploy contracts:
   ```bash
   npx hardhat run scripts/deploy-all.js --network localhost
   ```

### Testnet Deployment

Deploy to Sepolia testnet:

```bash
npx hardhat run scripts/deploy-all.js --network sepolia
```

The deployment script will:
1. Deploy the MasterFactory
2. Deploy all individual factories (BroadcastFactory, PublicFactory, PrivateFactory)
3. Register all factories with the MasterFactory
4. Set initial versions (version 0) as the current active versions
5. Save deployment addresses to the 'deployments' folder

## Upgrading Factories

To upgrade a specific factory:

```bash
npx hardhat run scripts/upgrade-factories.js --network sepolia broadcast
```

Replace "broadcast" with "public" or "private" to upgrade different factory types.

The upgrade script will:
1. Deploy a new version of the specified factory
2. Register it with the MasterFactory
3. Update the current version to point to the new factory
4. Save the updated deployment information

## Contract Verification

After deployment, verify your contracts on Etherscan:

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## Contract Structure

- **MasterFactory**: Controls versioning of all factory contracts
- **BroadcastFactory**: Creates BroadcastContract instances (public documents)
- **PublicFactory**: Creates PublicContract instances (targeted documents)
- **PrivateFactory**: Creates PrivateContract instances (private documents)

## Deployment Information

After deployment, contract addresses are saved in:
- `./deployments/{network}.json` - Current deployment
- `./deployments/{network}-{timestamp}.json` - Backup of each deployment
- `./deployment-addresses.json` - Latest deployment for easy access
