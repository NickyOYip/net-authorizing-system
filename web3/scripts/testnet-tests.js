const { ethers, network } = require("hardhat");
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');

async function main() {
  console.log(colors.yellow(`\n🔍 Running tests on ${network.name} testnet...\n`));
  
  // Verify we're on a testnet
  if (network.name === 'localhost' || network.name === 'hardhat') {
    console.error(colors.red('This script should be run on a testnet network. Use --network flag.'));
    process.exit(1);
  }
  
  // Load deployed contract addresses
  const deployedContracts = loadDeploymentData(network.name);
  if (!deployedContracts) {
    console.error(colors.red(`No deployment found for ${network.name}`));
    process.exit(1);
  }
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(colors.blue(`Using account: ${deployer.address}`));
  
  // Display balance
  const balance = await ethers.provider.getBalance(deployer.address);
  const formattedBalance = ethers.utils.formatEther(balance);
  console.log(colors.blue(`Account balance: ${formattedBalance} ETH\n`));
  
  // Connect to deployed contracts
  console.log(colors.yellow('Connecting to deployed contracts...'));
  
  const masterFactory = await ethers.getContractAt("MasterFactory", deployedContracts.masterFactory);
  const broadcastFactory = await ethers.getContractAt("BroadcastFactory", deployedContracts.broadcastFactory);
  const publicFactory = await ethers.getContractAt("PublicFactory", deployedContracts.publicFactory);
  const privateFactory = await ethers.getContractAt("PrivateFactory", deployedContracts.privateFactory);
  
  console.log(colors.green('✅ Connected to all contracts\n'));
  
  // Run tests
  await runMasterFactoryTests(masterFactory, deployedContracts);
  await runBroadcastFactoryTests(broadcastFactory);
  await runPublicFactoryTests(publicFactory);
  await runPrivateFactoryTests(privateFactory);
  
  console.log(colors.green('\n🎉 All tests completed successfully!'));
}

function loadDeploymentData(networkName) {
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  const filePath = path.join(deploymentsDir, `${networkName}.json`);
  
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    
    // Try latest.json as fallback
    const latestPath = path.join(deploymentsDir, `${networkName}`, 'latest.json');
    if (fs.existsSync(latestPath)) {
      return JSON.parse(fs.readFileSync(latestPath, 'utf8'));
    }
    
    console.error(colors.red(`No deployment data found in ${filePath} or ${latestPath}`));
    return null;
  } catch (error) {
    console.error(colors.red(`Error loading deployment data: ${error.message}`));
    return null;
  }
}

async function runMasterFactoryTests(masterFactory, deployedContracts) {
  console.log(colors.yellow('🧪 Testing MasterFactory...'));
  
  try {
    // Test 1: Check current versions
    console.log('  Testing current factory versions...');
    const currentVersions = await masterFactory.getCurrentVer();
    
    console.log(`  • Broadcast factory: ${currentVersions[0]}`);
    console.log(`  • Public factory: ${currentVersions[1]}`);
    console.log(`  • Private factory: ${currentVersions[2]}`);
    
    // Verify addresses match our deployment
    if (currentVersions[0].toLowerCase() !== deployedContracts.broadcastFactory.toLowerCase() ||
        currentVersions[1].toLowerCase() !== deployedContracts.publicFactory.toLowerCase() ||
        currentVersions[2].toLowerCase() !== deployedContracts.privateFactory.toLowerCase()) {
      throw new Error('Factory addresses mismatch with deployment data');
    }
    
    console.log(colors.green('  ✅ MasterFactory tests passed\n'));
  } catch (error) {
    console.error(colors.red(`  ❌ MasterFactory tests failed: ${error.message}`));
    throw error;
  }
}

async function runBroadcastFactoryTests(broadcastFactory) {
  console.log(colors.yellow('🧪 Testing BroadcastFactory...'));
  
  try {
    // Test 1: Create a new broadcast contract
    console.log('  Creating a new broadcast contract...');
    const title = `Test Contract ${Date.now()}`;
    const tx = await broadcastFactory.createBroadcastContract(title);
    console.log(`  Transaction hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`  Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Test 2: Verify contract was added
    console.log('  Checking contract was created...');
    const contracts = await broadcastFactory.getAllBroadcastContracts();
    const newContract = contracts[contracts.length - 1];
    
    console.log(`  New broadcast contract address: ${newContract}`);
    
    // Connect to the new contract to verify it exists
    const BroadcastContract = await ethers.getContractFactory("BroadcastContract");
    const broadcastContract = BroadcastContract.attach(newContract);
    
    const contractTitle = await broadcastContract.title();
    console.log(`  Contract title: ${contractTitle}`);
    
    if (contractTitle !== title) {
      throw new Error('Created contract title does not match');
    }
    
    console.log(colors.green('  ✅ BroadcastFactory tests passed\n'));
    return broadcastContract; // Return for potential further testing
  } catch (error) {
    console.error(colors.red(`  ❌ BroadcastFactory tests failed: ${error.message}`));
    throw error;
  }
}

async function runPublicFactoryTests(publicFactory) {
  console.log(colors.yellow('🧪 Testing PublicFactory...'));
  
  try {
    // Test 1: Create a new public contract
    console.log('  Creating a new public contract...');
    const title = `Test Public ${Date.now()}`;
    const activationCode = "testcode123"; // Plain text activation code
    
    const tx = await publicFactory.createPublicContract(title, activationCode);
    console.log(`  Transaction hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`  Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Test 2: Verify contract was added
    console.log('  Checking contract was created...');
    const contracts = await publicFactory.getAllPublicContracts();
    const newContract = contracts[contracts.length - 1];
    
    console.log(`  New public contract address: ${newContract}`);
    
    // Connect to the new contract to verify it exists
    const PublicContract = await ethers.getContractFactory("PublicContract");
    const publicContract = PublicContract.attach(newContract);
    
    const contractTitle = await publicContract.title();
    console.log(`  Contract title: ${contractTitle}`);
    
    if (contractTitle !== title) {
      throw new Error('Created contract title does not match');
    }
    
    console.log(colors.green('  ✅ PublicFactory tests passed\n'));
    return publicContract; // Return for potential further testing
  } catch (error) {
    console.error(colors.red(`  ❌ PublicFactory tests failed: ${error.message}`));
    throw error;
  }
}

async function runPrivateFactoryTests(privateFactory) {
  console.log(colors.yellow('🧪 Testing PrivateFactory...'));
  
  try {
    // Test 1: Create a new private contract
    console.log('  Creating a new private contract...');
    const title = `Test Private ${Date.now()}`;
    const activationCode = "testcode123"; // Plain text activation code
    
    const tx = await privateFactory.createPrivateContract(title, activationCode);
    console.log(`  Transaction hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`  Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Test 2: Verify contract was added
    console.log('  Checking contract was created...');
    const contracts = await privateFactory.getAllPrivateContracts();
    const newContract = contracts[contracts.length - 1];
    
    console.log(`  New private contract address: ${newContract}`);
    
    // Connect to the new contract to verify it exists
    const PrivateContract = await ethers.getContractFactory("PrivateContract");
    const privateContract = PrivateContract.attach(newContract);
    
    const contractTitle = await privateContract.title();
    console.log(`  Contract title: ${contractTitle}`);
    
    if (contractTitle !== title) {
      throw new Error('Created contract title does not match');
    }
    
    console.log(colors.green('  ✅ PrivateFactory tests passed\n'));
    return privateContract; // Return for potential further testing
  } catch (error) {
    console.error(colors.red(`  ❌ PrivateFactory tests failed: ${error.message}`));
    throw error;
  }
}

// Run the tests if script is executed directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(colors.red(`\n💥 Error: ${error.message}`));
      process.exit(1);
    });
}

module.exports = { main };
