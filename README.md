# Net Authorizing System

A blockchain-based document verification and authorization system that provides three levels of document verification:

- **📡 Broadcast Contracts**: Open and accessible to anyone
- **🌐 Public Contracts**: Targeted to specific users with activation codes
- **🔒 Private Contracts**: Secure document sharing with encrypted storage

## Features

- Multiple verification modes for different privacy/access needs
- Version control for documents with history tracking
- Blockchain-based verification for tamper-proof records
- Decentralized storage using Arweave via Irys
- Smart contract architecture with upgradeable factories

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
   ETHERSCAN_API_KEY=your_etherscan_api_key
   REPORT_GAS=true
   ```

4. Deploy contracts:
   ```bash
   # For local testing
   npx hardhat node
   npx hardhat run scripts/deploy-all.js --network localhost
   
   # For testnet (Sepolia)
   npx hardhat run scripts/deploy-all.js --network sepolia
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

3. Create a `.env.local` file (copy from `.env.example` if available)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

Refer to the [Vite README](./vite/README.md) for more detailed frontend information.

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
