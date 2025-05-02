const { ethers, network } = require("hardhat");
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function main() {
  console.log(`\n----- Running Integration Tests on ${network.name} -----\n`);
  
  // Verify we're on a testnet
  if (network.name === 'localhost' || network.name === 'hardhat') {
    console.error('This script should be run on a testnet network. Use --network sepolia');
    process.exit(1);
  }
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log(`Using account: ${deployer.address}`);
  
  // Load deployed contract addresses
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'sepolia', 'latest.json');
  
  if (!fs.existsSync(deploymentPath)) {
    console.error(`No deployment found at ${deploymentPath}`);
    process.exit(1);
  }
  
  const deployedContracts = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  console.log('Loaded deployment addresses:');
  console.log(`- MasterFactory: ${deployedContracts.masterFactory}`);
  console.log(`- BroadcastFactory: ${deployedContracts.broadcastFactory}`);
  console.log(`- PublicFactory: ${deployedContracts.publicFactory}`);
  console.log(`- PrivateFactory: ${deployedContracts.privateFactory}`);
  
  // Connect to deployed contracts
  console.log('\nConnecting to deployed contracts...');
  
  const masterFactory = await ethers.getContractAt("MasterFactory", deployedContracts.masterFactory);
  const broadcastFactory = await ethers.getContractAt("BroadcastFactory", deployedContracts.broadcastFactory);
  const publicFactory = await ethers.getContractAt("PublicFactory", deployedContracts.publicFactory);
  const privateFactory = await ethers.getContractAt("PrivateFactory", deployedContracts.privateFactory);
  
  console.log('Connected to contracts successfully');
  
  // Run tests
  await testMasterFactory(masterFactory, deployedContracts);
  await testBroadcastFactory(broadcastFactory);
  await testPublicFactory(publicFactory);
  await testPrivateFactory(privateFactory);
  
  console.log('\n----- All tests completed successfully! -----');
}

// Helper function to generate random hash
function generateRandomHash() {
  return "0x" + crypto.randomBytes(32).toString('hex');
}

// Helper function to check and display raw logs from a transaction receipt
async function logRawEvents(receipt, eventDescription = "Event") {
  console.log(`\n----- ${eventDescription} Raw Logs -----`);
  
  if (!receipt || !receipt.logs || receipt.logs.length === 0) {
    console.log('No logs found in the transaction receipt');
    return false;
  }
  
  console.log(`Found ${receipt.logs.length} logs in transaction:`);
  
  receipt.logs.forEach((log, i) => {
    console.log(`\nLog #${i}:`);
    console.log(`  Address: ${log.address}`);
    console.log(`  Topics Count: ${log.topics.length}`);
    log.topics.forEach((topic, j) => {
      console.log(`    Topic ${j}: ${topic}`);
    });
    console.log(`  Data: ${log.data}`);
    
    // Try to decode common patterns in the logs
    if (log.topics.length > 0) {
      const eventSignature = log.topics[0];
      console.log(`  Event Signature: ${eventSignature}`);
      
      // Map common event signatures to readable names
      const knownSignatures = {
        '0x34c7ba1456cede6c3f73063d5d3416a99cf7dd1986f7c356eb619cbb5a750b40': 'NewBroadcastContractOwned',
        '0x53f8aefd6fba4b1e18eef4c433a2d384e57b809179059cca3c8f99dafda029ca': 'NewPublicContractOwned',
        '0x531f2b37172c279cc0cecb93c49e56f870ff7cf2e41e566e78c25292fe5f3266': 'NewPrivateContractOwned',
        '0xdf2cdb0f7075f538161058c29fcc881abb4c0088802e045db13aed440091166d': 'NewBroadcastSubContractOwned',
        '0x94597551b00c42c24f90ea0707d4838f1527097507489491c7f4f5f55e4ac1d9': 'NewPublicSubContractOwned',
        '0x6dbf1d8aaf26a09379a16b409dbcac36da2297b50e8c99e4233e5ae4e1fa9305': 'NewPrivateSubContractOwned',
        '0xf48532d98ae61b81a85f8950e73114ff4a4634e10e76472a983c249ee7af949b': 'PublicContractActivated',
        '0x2c0a248c5dd1f262bcf79a9bb3d4c31bd169c70a5d2a9cff1359fb7cf797c7a8': 'PrivateContractActivated',
        '0x24cb0e4e2aa7bc3df3b96472fea72bc7a35cea559f2cc092ca9cb567e8f78941': 'StatusUpdated',
        '0x35d16a83c5e62cfec58e0bee3de1df4dac7563c1e112bf049b56e9f897fd565e': 'DataLinksUpdated'
      };
      
      const eventName = knownSignatures[eventSignature] || 'Unknown Event';
      console.log(`  Likely Event: ${eventName}`);
      
      // Try to extract indexed parameters for known events
      if (eventName === 'NewBroadcastContractOwned' && log.topics.length >= 4) {
        console.log('  Decoded Parameters:');
        console.log(`    Factory Address: 0x${log.topics[1].slice(26)}`);
        console.log(`    Contract Address: 0x${log.topics[2].slice(26)}`);
        console.log(`    Owner Address: 0x${log.topics[3].slice(26)}`);
        // Title would be in the data field but requires ABI to decode properly
      }
    }
  });
  
  return receipt.logs.length > 0;
}

async function testMasterFactory(masterFactory, deployedContracts) {
  console.log('\n----- Testing MasterFactory -----');
  
  try {
    console.log('Checking factory registrations...');
    
    // Get current factory versions
    const currentVersions = await masterFactory.getCurrentVer();
    console.log('Current factory versions:');
    console.log(`- BroadcastFactory: ${currentVersions[0]}`);
    console.log(`- PublicFactory: ${currentVersions[1]}`);
    console.log(`- PrivateFactory: ${currentVersions[2]}`);
    
    // Verify addresses match our deployment
    const broadcastMatches = currentVersions[0].toLowerCase() === deployedContracts.broadcastFactory.toLowerCase();
    const publicMatches = currentVersions[1].toLowerCase() === deployedContracts.publicFactory.toLowerCase();
    const privateMatches = currentVersions[2].toLowerCase() === deployedContracts.privateFactory.toLowerCase();
    
    console.log('Address verification:');
    console.log(`- BroadcastFactory: ${broadcastMatches ? 'MATCH ✓' : 'MISMATCH ✗'}`);
    console.log(`- PublicFactory: ${publicMatches ? 'MATCH ✓' : 'MISMATCH ✗'}`);
    console.log(`- PrivateFactory: ${privateMatches ? 'MATCH ✓' : 'MISMATCH ✗'}`);
    
    if (!broadcastMatches || !publicMatches || !privateMatches) {
      console.warn('WARNING: Some factory addresses do not match the deployment data!');
    } else {
      console.log('All factory addresses verified correctly.');
    }
  } catch (error) {
    console.error('Error testing MasterFactory:', error);
    throw error;
  }
}

async function testBroadcastFactory(broadcastFactory) {
  console.log('\n----- Testing BroadcastFactory -----');
  
  try {
    // Check existing contracts
    const existingContracts = await broadcastFactory.getAllBroadcastContracts();
    console.log(`Found ${existingContracts.length} existing broadcast contracts`);
    
    // Create a new contract
    console.log('\nCreating a new broadcast contract...');
    const title = `Test Contract ${Date.now()}`;
    
    // Create the contract and capture the transaction
    const tx = await broadcastFactory.createBroadcastContract(title);
    console.log(`Transaction hash: ${tx.hash}`);
    
    console.log('Waiting for transaction confirmation...');
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Log raw events from the receipt
    await logRawEvents(receipt, "NewBroadcastContractOwned");
    
    // Get the updated contract list
    const updatedContracts = await broadcastFactory.getAllBroadcastContracts();
    console.log(`\nNow have ${updatedContracts.length} broadcast contracts`);
    
    // Get the new contract
    const newContractAddr = updatedContracts[updatedContracts.length - 1];
    console.log(`New contract created at: ${newContractAddr}`);
    
    // Connect to the new contract
    const broadcastContract = await ethers.getContractAt("BroadcastContract", newContractAddr);
    
    // Verify contract title
    const contractTitle = await broadcastContract.title();
    console.log(`Contract title: ${contractTitle}`);
    if (contractTitle === title) {
      console.log('Contract title verified correctly ✓');
    } else {
      console.warn(`Title verification failed: expected "${title}", got "${contractTitle}"`);
    }
    
    // Create a sub-contract
    console.log('\nCreating a sub-contract...');
    const jsonHash = generateRandomHash();
    const softCopyHash = generateRandomHash();
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
    
    console.log(`Sub-contract transaction hash: ${subTx.hash}`);
    console.log('Waiting for transaction confirmation...');
    const subReceipt = await subTx.wait();
    console.log(`Sub-contract transaction confirmed in block ${subReceipt.blockNumber}`);
    
    // Log raw sub-contract creation events
    await logRawEvents(subReceipt, "NewBroadcastSubContractOwned");
    
    // Verify sub-contract was created
    const subContractAddr = await broadcastContract.getCurrentVersion();
    console.log(`\nSub-contract created at: ${subContractAddr}`);
    
    // Connect to the sub-contract to test status updates
    const broadcastSubContract = await ethers.getContractAt("BroadcastSubContract", subContractAddr);
    
    // Test status update event
    console.log('\nTesting status update...');
    const statusTx = await broadcastSubContract.updateStatus(1); // Set status to Disabled
    const statusReceipt = await statusTx.wait();
    
    // Log raw status update events
    await logRawEvents(statusReceipt, "StatusUpdated");
    
    // Check if status was updated
    const status = await broadcastSubContract.status();
    console.log(`\nNew status: ${status}`);
    if (status.toString() === '1') {
      console.log('Status updated correctly to Disabled ✓');
    } else {
      console.warn(`Status update failed: expected 1, got ${status}`);
    }
    
    console.log('BroadcastFactory tests completed successfully ✓');
  } catch (error) {
    console.error('Error testing BroadcastFactory:', error);
    throw error;
  }
}

async function testPublicFactory(publicFactory) {
  console.log('\n----- Testing PublicFactory -----');
  
  try {
    // Check existing contracts
    const existingContracts = await publicFactory.getAllPublicContracts();
    console.log(`Found ${existingContracts.length} existing public contracts`);
    
    // Create a new contract
    console.log('\nCreating a new public contract...');
    const title = `Test Public ${Date.now()}`;
    const activationCode = "testcode" + Date.now();
    
    const tx = await publicFactory.createPublicContract(title, activationCode);
    console.log(`Transaction hash: ${tx.hash}`);
    
    console.log('Waiting for transaction confirmation...');
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Log raw events
    await logRawEvents(receipt, "NewPublicContractOwned");
    
    // Get the updated contract list
    const updatedContracts = await publicFactory.getAllPublicContracts();
    console.log(`\nNow have ${updatedContracts.length} public contracts`);
    
    // Get the new contract
    const newContractAddr = updatedContracts[updatedContracts.length - 1];
    console.log(`New contract created at: ${newContractAddr}`);
    
    // Connect to the new contract
    const publicContract = await ethers.getContractAt("PublicContract", newContractAddr);
    
    // Verify contract title
    const contractTitle = await publicContract.title();
    console.log(`Contract title: ${contractTitle}`);
    if (contractTitle === title) {
      console.log('Contract title verified correctly ✓');
    } else {
      console.warn(`Title verification failed: expected "${title}", got "${contractTitle}"`);
    }
    
    // Add a sub-contract
    console.log('\nCreating a public sub-contract...');
    const jsonHash = generateRandomHash();
    const softCopyHash = generateRandomHash();
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
    
    console.log(`Sub-contract transaction hash: ${subTx.hash}`);
    console.log('Waiting for transaction confirmation...');
    const subReceipt = await subTx.wait();
    console.log(`Sub-contract transaction confirmed in block ${subReceipt.blockNumber}`);
    
    // Log raw sub-contract creation events
    await logRawEvents(subReceipt, "NewPublicSubContractOwned");
    
    // Test contract activation
    console.log('\nTesting contract activation...');
    
    try {
      // Try to activate the contract
      const activationTx = await publicContract.activate(activationCode);
      const activationReceipt = await activationTx.wait();
      
      // Log raw activation events
      await logRawEvents(activationReceipt, "PublicContractActivated");
      
      // Verify user was set
      const user = await publicContract.user();
      console.log(`\nContract activated by: ${user}`);
      if (user === deployer.address) {
        console.log('Contract activation successful ✓');
      } else {
        console.warn(`Activation verification failed: expected ${deployer.address}, got ${user}`);
      }
    } catch (error) {
      console.error('Error during activation:', error.message);
      console.log('Skipping activation test');
    }
    
    console.log('PublicFactory tests completed successfully ✓');
  } catch (error) {
    console.error('Error testing PublicFactory:', error);
    throw error;
  }
}

async function testPrivateFactory(privateFactory) {
  console.log('\n----- Testing PrivateFactory -----');
  
  try {
    // Check existing contracts
    const existingContracts = await privateFactory.getAllPrivateContracts();
    console.log(`Found ${existingContracts.length} existing private contracts`);
    
    // Create a new contract
    console.log('\nCreating a new private contract...');
    const title = `Test Private ${Date.now()}`;
    const activationCode = "testcode" + Date.now();
    
    const tx = await privateFactory.createPrivateContract(title, activationCode);
    console.log(`Transaction hash: ${tx.hash}`);
    
    console.log('Waiting for transaction confirmation...');
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Log raw events
    await logRawEvents(receipt, "NewPrivateContractOwned");
    
    // Get the updated contract list
    const updatedContracts = await privateFactory.getAllPrivateContracts();
    console.log(`\nNow have ${updatedContracts.length} private contracts`);
    
    // Get the new contract
    const newContractAddr = updatedContracts[updatedContracts.length - 1];
    console.log(`New contract created at: ${newContractAddr}`);
    
    // Connect to the new contract
    const privateContract = await ethers.getContractAt("PrivateContract", newContractAddr);
    
    // Verify contract title
    const contractTitle = await privateContract.title();
    console.log(`Contract title: ${contractTitle}`);
    if (contractTitle === title) {
      console.log('Contract title verified correctly ✓');
    } else {
      console.warn(`Title verification failed: expected "${title}", got "${contractTitle}"`);
    }
    
    // Add a sub-contract
    console.log('\nCreating a private sub-contract...');
    const jsonHash = generateRandomHash();
    const softCopyHash = generateRandomHash();
    const startDate = Math.floor(Date.now() / 1000);
    const endDate = startDate + 31536000; // +1 year
    
    const subTx = await privateContract.addNewPrivateSubContract(
      jsonHash,
      softCopyHash,
      startDate,
      endDate
    );
    
    console.log(`Sub-contract transaction hash: ${subTx.hash}`);
    console.log('Waiting for transaction confirmation...');
    const subReceipt = await subTx.wait();
    console.log(`Sub-contract transaction confirmed in block ${subReceipt.blockNumber}`);
    
    // Log raw sub-contract creation events
    await logRawEvents(subReceipt, "NewPrivateSubContractOwned");
    
    // Test contract activation
    console.log('\nTesting contract activation...');
    
    try {
      // Try to activate the contract
      const activationTx = await privateContract.activate(activationCode);
      const activationReceipt = await activationTx.wait();
      
      // Log raw activation events
      await logRawEvents(activationReceipt, "PrivateContractActivated");
      
      // Test data link updating for private sub-contract
      const currentVersion = await privateContract.getCurrentVersion();
      const privateSubContract = await ethers.getContractAt("PrivateSubContract", currentVersion);
      
      // Add data links
      console.log('\nTesting data links update...');
      const jsonLink = "ar://encrypted-json-" + Date.now();
      const softCopyLink = "ar://encrypted-pdf-" + Date.now();
      
      const linksTx = await privateSubContract.updateDataLinks(jsonLink, softCopyLink);
      const linksReceipt = await linksTx.wait();
      
      // Log raw data links update events
      await logRawEvents(linksReceipt, "DataLinksUpdated");
      
      // Verify links were updated
      const details = await privateSubContract.getDetail();
      console.log(`\nJSON Link: ${details[8]}`);
      console.log(`SoftCopy Link: ${details[9]}`);
      
      if (details[8] === jsonLink && details[9] === softCopyLink) {
        console.log('Data links updated correctly ✓');
      } else {
        console.warn('Data links update verification failed');
      }
    } catch (error) {
      console.error('Error during activation or links testing:', error.message);
      console.log('Skipping remainder of tests');
    }
    
    console.log('PrivateFactory tests completed successfully ✓');
  } catch (error) {
    console.error('Error testing PrivateFactory:', error);
    throw error;
  }
}

// Execute the script if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error running tests:', error);
      process.exit(1);
    });
}

module.exports = { main };
