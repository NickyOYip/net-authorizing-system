# Net Authorizing System - Frontend

This is the frontend application for the Net Authorizing System, a blockchain-based document verification platform that offers three levels of document security:

- **📡 Broadcast**: Open and accessible documents visible to all
- **🌐 Public**: Targeted documents requiring activation codes
- **🔒 Private**: Confidential documents with encryption

## Features

- Connect wallet with Web3 integration
- Create and manage verification contracts
- Upload documents to decentralized storage via Irys (Arweave)
- Activate contracts with activation codes
- Verify document authenticity against blockchain records
- View document history and versions
- Dashboard for managing all your contracts

## Project Structure

```
vite/
├── public/             # Static assets
└── src/
    ├── components/     # Reusable UI components
    │   ├── ConnectionPopup.jsx  # Wallet connection interface
    │   ├── Layout.tsx          # Page layout wrapper
    │   ├── Navbar.jsx          # Navigation bar
    │   ├── Sidebar.jsx         # Sidebar navigation
    │   └── ...
    ├── hooks/
    │   ├── contractHook/       # Smart contract integration hooks
    │   │   ├── abis/           # Contract ABIs
    │   │   ├── helpers/        # Helper functions for contracts
    │   │   └── utils/          # Contract utility functions
    │   └── irysHook/           # Arweave/Irys integration
    ├── pages/                  # Main application pages
    │   ├── Activate.tsx        # Contract activation page
    │   ├── Create.jsx          # Create new contracts
    │   ├── Home.tsx            # Dashboard/home page
    │   ├── Verify.tsx          # Document verification
    │   └── View.tsx            # Contract and document viewing
    ├── provider/               # React context providers
    │   ├── dataProvider.tsx    # App data provider
    │   └── walletProvider.tsx  # Wallet connection provider
    ├── services/               # Business logic services
    │   ├── activateService.ts  # Contract activation
    │   ├── createService.ts    # Contract creation
    │   ├── verifyService.ts    # Document verification
    │   └── ...
    ├── styles/                 # CSS styles
    └── utils/                  # Utility functions
        ├── contractUtils.ts    # Contract utilities
        ├── encryptionUtils.ts  # Encryption/decryption utils
        └── networkUtils.ts     # Network-related utilities
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MetaMask or other Web3 wallet

### Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Create a `.env.local` file with required environment variables:
   ```
   VITE_IRYS_NODE=https://node2.irys.xyz
   VITE_DEFAULT_CHAIN_ID=11155111 # Sepolia testnet
   VITE_CONTRACT_ADDRESSES_PATH=/deployments/latest.json
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Network Configuration

This application operates across two Ethereum testnets:

- **Hoodi**: Primary network for Ethereum contract deployments and interactions
- **Sepolia**: Secondary network for Irys/Arweave storage operations

### Network Limitations

**Important to know when using the application:**

- The dashboard may not show all activated contracts from the Hoodi network
- This is because The Graph (event indexing service) is not available on Hoodi
- **Workaround**: Use the search functionality to find contracts deployed on Hoodi

### Getting Test ETH

Before using the application, obtain test ETH from:
- Sepolia: [https://sepolia-faucet.pk910.de/](https://sepolia-faucet.pk910.de/) - Used for storage operations
- Hoodi: [https://hoodi-faucet.pk910.de/](https://hoodi-faucet.pk910.de/) - Used for contract interactions

### Important: Devnet Storage Limitations

This application currently uses Irys devnet for storing data on Arweave. Be aware of these limitations:

- **Data Retention**: Files stored on Irys devnet are automatically deleted after 60 days
- **Testing Only**: The devnet is suitable for testing but not for production use
- **Backups Required**: Always keep local backups of any documents you upload through this system

To configure the application for permanent storage:
1. Create an Irys account and fund it with AR tokens
2. Update the environment variable to point to the mainnet node:
   ```
   VITE_IRYS_NODE=https://node1.irys.xyz
   ```
3. Adjust the frontend code to handle mainnet transaction fees

## Usage

### Creating a Document Contract

1. Connect your wallet
2. Navigate to "Create" page
3. Select contract type (Broadcast, Public, or Private)
4. Fill out document details and upload files
5. Submit the transaction

### Activating a Contract

1. Navigate to "Activate" page
2. Enter the contract address and activation code
3. For Private contracts, upload encrypted document files
4. Complete the activation

### Verifying Documents

1. Navigate to "Verify" page
2. Enter contract address or search for documents by owner
3. View document details and verification status
4. Compare document hash with on-chain record

## Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Learn More

- [Contract Design](../docs/ContractDesign.md) - Smart contract architecture overview
- [User Flow](../docs/UserFlow.md) - Learn about document flows and verification processes
- [Web3 Integration](../web3/README.md) - Smart contract deployment and interaction
