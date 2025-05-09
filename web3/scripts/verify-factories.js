const { execSync } = require('child_process');

async function main() {
  // Read the deployment addresses from a JSON file
  // You need to create this file after deployment with the addresses
  const deployedAddresses = require('../deployment-addresses.json');
  
  console.log("Starting contract verification...");
  
  // Verify each contract
  try {
    // Verify MasterFactory
    console.log("\nVerifying MasterFactory...");
    execSync(`npx hardhat verify --network ${process.env.HARDHAT_NETWORK} ${deployedAddresses.masterFactoryAddress}`, { stdio: 'inherit' });
    
    // Verify BroadcastFactory
    console.log("\nVerifying BroadcastFactory...");
    execSync(`npx hardhat verify --network ${process.env.HARDHAT_NETWORK} ${deployedAddresses.broadcastFactoryAddress}`, { stdio: 'inherit' });
    
    // Verify PublicFactory
    console.log("\nVerifying PublicFactory...");
    execSync(`npx hardhat verify --network ${process.env.HARDHAT_NETWORK} ${deployedAddresses.publicFactoryAddress}`, { stdio: 'inherit' });
    
    // Verify PrivateFactory
    console.log("\nVerifying PrivateFactory...");
    execSync(`npx hardhat verify --network ${process.env.HARDHAT_NETWORK} ${deployedAddresses.privateFactoryAddress}`, { stdio: 'inherit' });
    
    console.log("\nAll contracts verified successfully!");
  } catch (error) {
    console.error("Error during verification:", error);
  }
}

// Execute the verification
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
