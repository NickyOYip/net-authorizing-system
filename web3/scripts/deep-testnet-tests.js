const { ethers, network } = require("hardhat");
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');

async function main() {
  console.log(colors.yellow(`\n🔍 Running deep integration tests on ${network.name} testnet...\n`));
  
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
  
  // Get signers - we need at least 2 for owner/user tests
  const [deployer, user] = await ethers.getSigners();
  console.log(colors.blue(`Using account: ${deployer.address}`));
  console.log(colors.blue(`Using test user account: ${user.address}`));
  
  // Connect to deployed contracts
  console.log(colors.yellow('Connecting to deployed contracts...'));
  
  const broadcastFactory = await ethers.getContractAt("BroadcastFactory", deployedContracts.broadcastFactory);
  const publicFactory = await ethers.getContractAt("PublicFactory", deployedContracts.publicFactory);
  const privateFactory = await ethers.getContractAt("PrivateFactory", deployedContracts.privateFactory);
  
  console.log(colors.green('✅ Connected to factory contracts\n'));
  
  // Run deep tests on all contract types
  await deepTestBroadcastContracts(broadcastFactory, deployer);
  await deepTestPublicContracts(publicFactory, deployer, user);
  await deepTestPrivateContracts(privateFactory, deployer, user);
  
  console.log(colors.green('\n🎉 All deep integration tests completed successfully!'));
}

function loadDeploymentData(networkName) {
  // Same as in testnet-tests.js
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

async function deepTestBroadcastContracts(broadcastFactory, deployer) {
  console.log(colors.yellow('🧪 Deep testing Broadcast contracts...'));
  
  try {
    // Test 1: Create a new broadcast contract
    console.log('  Creating a new broadcast contract...');
    const title = `Deep Test Broadcast ${Date.now()}`;
    const tx = await broadcastFactory.createBroadcastContract(title);
    console.log(`  Transaction hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`  Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Get the contract address
    const contracts = await broadcastFactory.getAllBroadcastContracts();
    const contractAddr = contracts[contracts.length - 1];
    console.log(`  New broadcast contract: ${contractAddr}`);
    
    // Connect to the contract
    const broadcastContract = await ethers.getContractAt("BroadcastContract", contractAddr);
    console.log(`  Connected to broadcast contract`);
    
    // Test 2: Add a sub-contract
    console.log('  Creating a sub-contract...');
    const jsonHash = ethers.utils.id("jsonData" + Date.now());
    const softCopyHash = ethers.utils.id("softCopyData" + Date.now());
    const storageLink = "ar://testlink" + Date.now();
    const startDate = Math.floor(Date.now() / 1000);
    const endDate = startDate + 31536000; // +1 year
    
    const subTx = await broadcastContract.addNewBroadcastSubContract(
      jsonHash,
      softCopyHash,
      storageLink,
      startDate,
      endDate
    );
    
    console.log(`  Sub-contract transaction hash: ${subTx.hash}`);
    const subReceipt = await subTx.wait();
    console.log(`  Sub-contract transaction confirmed in block ${subReceipt.blockNumber}`);
    
    // Test 3: Verify sub-contract was created
    const subContractAddr = await broadcastContract.getCurrentVersion();
    console.log(`  Sub-contract address: ${subContractAddr}`);
    
    // Connect to the sub-contract
    const broadcastSubContract = await ethers.getContractAt("BroadcastSubContract", subContractAddr);
    
    // Test 4: Check sub-contract details
    const details = await broadcastSubContract.getDetail();
    console.log(`  Verified sub-contract details:`);
    console.log(`  - Owner: ${details[1]}`);
    console.log(`  - Status: ${details[2]}`); // Should be 0 (Active)
    console.log(`  - Storage link: ${details[6]}`);
    console.log(`  - Start date: ${details[7]}`);
    console.log(`  - End date: ${details[8]}`);
    
    console.log(colors.green('  ✅ Broadcast contract deep tests passed'));
    
    return broadcastContract; // Return for potential further testing
  } catch (error) {
    console.error(colors.red(`  ❌ Broadcast contract deep tests failed: ${error.message}`));
    throw error;
  }
}

async function deepTestPublicContracts(publicFactory, deployer, user) {
  console.log(colors.yellow('\n🧪 Deep testing Public contracts...'));
  
  try {
    // Test 1: Create a new public contract
    console.log('  Creating a new public contract...');
    const title = `Deep Test Public ${Date.now()}`;
    const activationCode = "testcode" + Date.now();
    
    const tx = await publicFactory.createPublicContract(title, activationCode);
    console.log(`  Transaction hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`  Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Get the contract address
    const contracts = await publicFactory.getAllPublicContracts();
    const contractAddr = contracts[contracts.length - 1];
    console.log(`  New public contract: ${contractAddr}`);
    
    // Connect to the contract
    const publicContract = await ethers.getContractAt("PublicContract", contractAddr);
    console.log(`  Connected to public contract`);
    
    // Test 2: Add a sub-contract
    console.log('  Creating a sub-contract...');
    const jsonHash = ethers.utils.id("jsonData" + Date.now());
    const softCopyHash = ethers.utils.id("softCopyData" + Date.now());
    const storageLink = "ar://testlink" + Date.now();
    const startDate = Math.floor(Date.now() / 1000);
    const endDate = startDate + 31536000; // +1 year
    
    const subTx = await publicContract.addNewPublicSubContract(
      jsonHash,
      softCopyHash,
      storageLink,
      startDate,
      endDate
    );
    
    console.log(`  Sub-contract transaction hash: ${subTx.hash}`);
    const subReceipt = await subTx.wait();
    console.log(`  Sub-contract transaction confirmed in block ${subReceipt.blockNumber}`);
    
    // Test 3: Verify sub-contract was created
    const subContractAddr = await publicContract.getCurrentVersion();
    console.log(`  Sub-contract address: ${subContractAddr}`);
    
    // Test 4: Activate the contract as user
    console.log(`  Activating contract as user: ${user.address}...`);
    const activateTx = await publicContract.connect(user).activate(activationCode);
    const activateReceipt = await activateTx.wait();
    console.log(`  Activation confirmed in block ${activateReceipt.blockNumber}`);
    
    // Verify user was set correctly
    const contractUser = await publicContract.user();
    console.log(`  Contract user: ${contractUser}`);
    
    if (contractUser.toLowerCase() !== user.address.toLowerCase()) {
      throw new Error('Contract user does not match the activating user');
    }
    
    console.log(colors.green('  ✅ Public contract deep tests passed'));
    
    return publicContract; // Return for potential further testing
  } catch (error) {
    console.error(colors.red(`  ❌ Public contract deep tests failed: ${error.message}`));
    throw error;
  }
}

async function deepTestPrivateContracts(privateFactory, deployer, user) {
  console.log(colors.yellow('\n🧪 Deep testing Private contracts...'));
  
  try {
    // Test 1: Create a new private contract
    console.log('  Creating a new private contract...');
    const title = `Deep Test Private ${Date.now()}`;
    const activationCode = "testcode" + Date.now();
    
    const tx = await privateFactory.createPrivateContract(title, activationCode);
    console.log(`  Transaction hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`  Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Get the contract address
    const contracts = await privateFactory.getAllPrivateContracts();
    const contractAddr = contracts[contracts.length - 1];
    console.log(`  New private contract: ${contractAddr}`);
    
    // Connect to the contract
    const privateContract = await ethers.getContractAt("PrivateContract", contractAddr);
    console.log(`  Connected to private contract`);
    
    // Test 2: Add a sub-contract
    console.log('  Creating a sub-contract...');
    const jsonHash = ethers.utils.id("jsonData" + Date.now());
    const softCopyHash = ethers.utils.id("softCopyData" + Date.now());
    const startDate = Math.floor(Date.now() / 1000);
    const endDate = startDate + 31536000; // +1 year
    
    const subTx = await privateContract.addNewPrivateSubContract(
      jsonHash,
      softCopyHash,
      startDate,
      endDate
    );
    
    console.log(`  Sub-contract transaction hash: ${subTx.hash}`);
    const subReceipt = await subTx.wait();
    console.log(`  Sub-contract transaction confirmed in block ${subReceipt.blockNumber}`);
    
    // Test 3: Verify sub-contract was created
    const subContractAddr = await privateContract.getCurrentVersion();
    console.log(`  Sub-contract address: ${subContractAddr}`);
    
    // Test 4: Activate the contract as user
    console.log(`  Activating contract as user: ${user.address}...`);
    const activateTx = await privateContract.connect(user).activate(activationCode);
    const activateReceipt = await activateTx.wait();
    console.log(`  Activation confirmed in block ${activateReceipt.blockNumber}`);
    
    // Verify user was set correctly
    const contractUser = await privateContract.user();
    console.log(`  Contract user: ${contractUser}`);
    
    if (contractUser.toLowerCase() !== user.address.toLowerCase()) {
      throw new Error('Contract user does not match the activating user');
    }
    
    // Test 5: Add data links as user
    console.log('  Adding encrypted data links as user...');
    const privateSubContract = await ethers.getContractAt("PrivateSubContract", subContractAddr);
    const jsonLink = "ar://encrypted-json-" + Date.now();
    const softCopyLink = "ar://encrypted-pdf-" + Date.now();
    
    const linkTx = await privateSubContract.connect(user).updateDataLinks(jsonLink, softCopyLink);
    const linkReceipt = await linkTx.wait();
    console.log(`  Links updated in block ${linkReceipt.blockNumber}`);
    
    // Verify links were set
    const details = await privateSubContract.getDetail();
    console.log(`  JSON Link: ${details[8]}`);
    console.log(`  SoftCopy Link: ${details[9]}`);
    
    if (details[8] !== jsonLink || details[9] !== softCopyLink) {
      throw new Error('Data links were not properly updated');
    }
    
    console.log(colors.green('  ✅ Private contract deep tests passed'));
    
    return privateContract; // Return for potential further testing
  } catch (error) {
    console.error(colors.red(`  ❌ Private contract deep tests failed: ${error.message}`));
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
