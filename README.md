# Net Authorizing System

A blockchain-based document verification and authorization system that provides three levels of document verification:

- **📡 Broadcast Contracts**: Open and accessible to anyone
- **🌐 Public Contracts**: Targeted to specific users with activation codes
- **🔒 Private Contracts**: Secure document sharing with encrypted storage

## Project Overview

The Net Authorizing System (NAT) is a decentralized application (DApp) designed to address e-document forgery and inefficient verification processes. Built on Ethereum blockchain with Arweave for decentralized storage, NAT enables secure creation, management, and verification of documents through smart contracts.

This system integrates MetaMask for self-sovereign identity, ensuring secure and transparent user interactions without relying on centralized servers. It was developed as a Final Year Project to demonstrate how blockchain technology can enhance document trustworthiness.

## Dual-Chain Architecture

This is a fully decentralized application running on two Ethereum testnets:
- **Hoodi**: Primary network for Ethereum contract deployments
- **Sepolia**: Secondary network for Irys/Arweave storage operations

To use this application, you'll need test ETH on both networks. You can obtain test ETH from the following faucets:

- Sepolia Faucet: [https://sepolia-faucet.pk910.de/](https://sepolia-faucet.pk910.de/)
- Hoodi Faucet: [https://hoodi-faucet.pk910.de/](https://hoodi-faucet.pk910.de/)

Please request test ETH from these faucets before attempting to create or interact with contracts.

### Why Two Networks?

The dual-chain approach addresses specific technical challenges:

1. **Gas Cost Management**: Hoodi network offers more stable and lower gas fees for smart contract deployments and interactions.

2. **Storage Operations**: Sepolia is used for Irys operations to store documents on Arweave, leveraging its compatibility with decentralized storage solutions.

3. **Event Querying Limitations**: The Graph (event query service) is not currently supported on the Hoodi network. As a result:
   - The dashboard may not show all activated contracts that exist on the Hoodi network
   - Users can still access these contracts by using the search function

This hybrid approach allows for cost-effective operations while maintaining essential functionality across both networks.

## Important Notes on Data Storage

**⚠️ Development Environment Limitations:**

This project currently uses Irys devnet for storing data on Arweave. Please be aware that:

- All data stored on Irys devnet will be **deleted after 60 days**
- For permanent storage, the application must be configured to use Irys mainnet
- Transition to production would require funding an Irys account with AR tokens

During development and testing, please keep local backups of any important documents uploaded to the system, as they will not be permanently stored on the devnet.

## Key Features

- **Modular Smart Contracts**: Split Contracts architecture with three contract types:
  - Broadcast (publicly accessible)
  - Public (entity-issued with activation codes)
  - Private (sensitive data with encryption)

- **Decentralized Storage**: Arweave integration via Irys reduces storage costs from $1088/MB (Ethereum) to $0.02/MB

- **Event-Based Data Access**: Optimized UI rendering through Ethereum events, reducing costs by 96%

- **Security**: Blockchain immutability and MetaMask authentication prevent forgery and unauthorized access

- **Version Control**: Document versioning with full history tracking

- **Role-Based Access**: Different interfaces for document issuers, recipients, and verifiers

## Technical Achievements

- 97% transaction success rate across testing scenarios
- 80% reduction in verification time compared to traditional systems
- ~$63 HKD per contract deployment cost (estimated for Ethereum mainnet)
- Elimination of single points of failure in document management

## Project Structure

```
net-authorizing-system/
├── docs/               # Project documentation
│   ├── ContractDesign.md     # Smart contract architecture
│   └── UserFlow.md           # User interaction flows
├── web3/               # Smart contract code and deployment
│   ├── contracts/      # Solidity smart contracts
│   ├── scripts/        # Deployment & testing scripts
│   ├── deployments/    # Deployment records
│   └── test/           # Contract test files
├── vite/               # Frontend application
│   ├── public/         # Static assets
│   └── src/            # Frontend source code
│       ├── components/ # UI components
│       ├── hooks/      # Custom React hooks
│       │   ├── contractHook/  # Contract integration
│       │   └── irysHook/      # Arweave/Irys integration
│       ├── pages/      # Application pages
│       └── services/   # External services
└── testData/          # Data for testing
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MetaMask or other web3 wallet
- Test ETH on Sepolia and Hoodi networks

### Smart Contract Setup

1. Navigate to the web3 directory:
   ```bash
   cd web3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your credentials:
   ```
   PRIVATE_KEY=your_private_key_without_0x_prefix
   SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
   HOODI_RPC_URL=https://rpc.testnet.hoodinetwork.com
   ETHERSCAN_API_KEY=your_etherscan_api_key
   REPORT_GAS=true
   ```

4. Deploy contracts:
   ```bash
   # For local testing
   npx hardhat node
   npx hardhat run scripts/deploy-all.js --network localhost
   
   # For Sepolia testnet
   npx hardhat run scripts/deploy-all.js --network sepolia
   
   # For Hoodi testnet
   npx hardhat run scripts/deploy-all.js --network hoodi
   ```

Refer to the [Web3 README](./web3/README.md) for more detailed information on smart contract deployment and testing.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd vite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with network configuration:
   ```
   VITE_IRYS_NODE=https://node2.irys.xyz
   VITE_DEFAULT_CHAIN_ID=11155111 # Sepolia testnet
   VITE_HOODI_CHAIN_ID=80085 # Hoodi testnet
   VITE_CONTRACT_ADDRESSES_PATH=/deployments/latest.json
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

Refer to the [Vite README](./vite/README.md) for more detailed frontend information.

## Network Configuration

To use the application, you'll need to configure your MetaMask wallet with both networks:

### Sepolia Network
- Network Name: Sepolia
- RPC URL: https://eth-sepolia.public.blastapi.io
- Chain ID: 11155111
- Currency Symbol: ETH
- Block Explorer: https://sepolia.etherscan.io/

### Hoodi Network
- Network Name: Hoodi Testnet
- RPC URL: https://rpc.testnet.hoodinetwork.com
- Chain ID: 80085
- Currency Symbol: HOO
- Block Explorer: https://explorer.testnet.hoodinetwork.com/

## Usage

### Document Creation

1. Connect your wallet to the application
2. Select the appropriate contract type:
   - Broadcast: For public documents visible to all
   - Public: For documents with specific recipients
   - Private: For confidential documents with encryption
3. Upload your document and metadata
4. Complete the transaction to store your document reference on-chain

### Document Verification

1. Search for documents by contract address, owner address, or document ID
2. View the document details and verification status
3. Download and verify the document contents against on-chain hashes

## Documentation

- [Contract Design](./docs/ContractDesign.md) - Detailed smart contract architecture
- [User Flow](./docs/UserFlow.md) - Step-by-step user interaction flows

## Team

- IEONG Kai Yip (Alex)
- WONG Ka Ho (Shison)
- WONG Ki Tung (Nicky)

## Advisors

- Dr. AU YEUNG Siu Kei (Jeff)
- Dr. TAO Bishenghui

## Acknowledgments

We thank Kinetix Systems Limited for their business insights, Dr. Ma Xiaoxue for demo feedback, and the open-source communities behind Solidity, React, MetaMask, Hardhat, and Arweave.

## License

This project is licensed under the MIT License.
