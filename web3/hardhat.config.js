require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Load environment variables
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
// Add Hoodi explorer API key (if needed)
const HOODI_API_KEY = process.env.HOODI_API_KEY || "";

// Remove 0x prefix if present and ensure it's a string
const cleanPrivateKey = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY.slice(2) : PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.23",
    settings: {
      viaIR: false,
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      mining: {
        auto: true,
        interval: 0
      },
      allowBlocksWithSameTimestamp: true // Allow blocks with same timestamp
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: cleanPrivateKey ? [`0x${cleanPrivateKey}`] : [],
      chainId: 11155111,
    },
    hoodi: {
      url: "https://0xrpc.io/hoodi",
      accounts: cleanPrivateKey ? [`0x${cleanPrivateKey}`] : [],
      chainId: 560048,
    },
  },
  etherscan: {
    apiKey: {
      // Standard networks
      sepolia: ETHERSCAN_API_KEY,
      
      // Custom networks
      hoodi: ETHERSCAN_API_KEY, // Add your Hoodi explorer API key here if required
    },
    customChains: [
      {
        network: "hoodi",
        chainId: 560048,
        urls: {
          // Replace these URLs with the actual Hoodi block explorer API endpoints
          apiURL: "https://api-hoodi.etherscan.io/api", // Replace with actual API URL
          browserURL: "https://hoodi.etherscan.io/"      // Replace with actual browser URL
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
