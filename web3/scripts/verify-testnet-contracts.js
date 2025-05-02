const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');

async function main() {
  const network = hre.network.name;
  console.log(colors.yellow(`\n🔍 Verifying contracts on ${network}...\n`));
  
  // Verify we're on a testnet
  if (network === 'localhost' || network === 'hardhat') {
    console.error(colors.red('This script should be run on a testnet network. Use --network flag.'));
    process.exit(1);
  }
  
  // Load deployed contract addresses
  const deploymentPath = path.join(__dirname, "..", "deployments", `${network}.json`);
  
  if (!fs.existsSync(deploymentPath)) {
    console.error(colors.red(`No deployment found for ${network} at ${deploymentPath}`));
    process.exit(1);
  }
  
  const deployedContracts = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  console.log(colors.blue('Loaded deployment data:'));
  console.log(colors.blue(`- MasterFactory: ${deployedContracts.masterFactory}`));
  console.log(colors.blue(`- BroadcastFactory: ${deployedContracts.broadcastFactory}`));
  console.log(colors.blue(`- PublicFactory: ${deployedContracts.publicFactory}`));
  console.log(colors.blue(`- PrivateFactory: ${deployedContracts.privateFactory}`));
  
  // Verify each contract
  await verifyContract("MasterFactory", deployedContracts.masterFactory);
  await verifyContract("BroadcastFactory", deployedContracts.broadcastFactory);
  await verifyContract("PublicFactory", deployedContracts.publicFactory);
  await verifyContract("PrivateFactory", deployedContracts.privateFactory);
  
  console.log(colors.green('\n✅ Verification process completed!'));
}

async function verifyContract(contractName, address) {
  console.log(colors.yellow(`\nVerifying ${contractName} at ${address}...`));
  
  try {
    // These contracts don't have constructor arguments
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log(colors.green(`✅ ${contractName} verified successfully!`));
  } catch (error) {
    if (error.message.includes("Already Verified") || 
        error.message.includes("Already verified") ||
        error.message.includes("Contract source code already verified")) {
      console.log(colors.blue(`ℹ️  ${contractName} is already verified`));
    } else {
      console.error(colors.red(`❌ Failed to verify ${contractName}: ${error.message}`));
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(colors.red(`\n💥 Error: ${error.message}`));
    process.exit(1);
  });
