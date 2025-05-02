const { ethers, network } = require("hardhat");
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define constants
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function main() {
  console.log(`\n----- Contract Data Viewer on ${network.name} -----\n`);
  
  // Verify we're on a testnet
  if (network.name === 'localhost' || network.name === 'hardhat') {
    console.error('This script should be run on a testnet network. Use --network sepolia');
    process.exit(1);
  }
  
  const contractType = await promptQuestion(
    'Enter contract type (master/broadcast/public/private/bsub/psub/prisub): '
  );
  
  const contractAddress = await promptQuestion('Enter contract address: ');
  
  try {
    switch(contractType.toLowerCase()) {
      case 'master':
        await viewMasterFactory(contractAddress);
        break;
      case 'broadcast':
        await viewBroadcastContract(contractAddress);
        break;
      case 'public':
        await viewPublicContract(contractAddress);
        break;
      case 'private':
        await viewPrivateContract(contractAddress);
        break;
      case 'bsub':
        await viewBroadcastSubContract(contractAddress);
        break;
      case 'psub':
        await viewPublicSubContract(contractAddress);
        break;
      case 'prisub':
        await viewPrivateSubContract(contractAddress);
        break;
      default:
        console.error('Invalid contract type');
    }
  } catch (error) {
    console.error('Error viewing contract data:', error.message);
  }
  
  rl.close();
}

async function viewMasterFactory(address) {
  console.log('\n----- MasterFactory Data -----');
  
  const masterFactory = await ethers.getContractAt('MasterFactory', address);
  
  // Basic info
  const owner = await masterFactory.owner();
  console.log(`Owner: ${owner}`);
  
  // Get current versions
  const currentVersions = await masterFactory.getCurrentVer();
  console.log('\nCurrent Factory Versions:');
  console.log(`- BroadcastFactory: ${currentVersions[0]}`);
  console.log(`- PublicFactory: ${currentVersions[1]}`);
  console.log(`- PrivateFactory: ${currentVersions[2]}`);
  
  // Get all versions
  const allVersions = await masterFactory.getAllVer();
  console.log('\nAll BroadcastFactory Versions:');
  for (let i = 0; i < allVersions[0].length; i++) {
    console.log(`[${i}] ${allVersions[0][i]}`);
  }
  
  console.log('\nAll PublicFactory Versions:');
  for (let i = 0; i < allVersions[1].length; i++) {
    console.log(`[${i}] ${allVersions[1][i]}`);
  }
  
  console.log('\nAll PrivateFactory Versions:');
  for (let i = 0; i < allVersions[2].length; i++) {
    console.log(`[${i}] ${allVersions[2][i]}`);
  }
}

async function viewBroadcastContract(address) {
  console.log('\n----- BroadcastContract Data -----');
  
  const broadcastContract = await ethers.getContractAt('BroadcastContract', address);
  
  // Basic info
  const owner = await broadcastContract.owner();
  const title = await broadcastContract.title();
  const totalVerNo = await broadcastContract.totalVerNo();
  const activeVer = await broadcastContract.activeVer();
  
  console.log(`Owner: ${owner}`);
  console.log(`Title: ${title}`);
  console.log(`Total Versions: ${totalVerNo}`);
  console.log(`Active Version: ${activeVer}`);
  
  // Get all sub-contracts
  if (totalVerNo > 0) {
    console.log('\nAll Sub-contracts:');
    for (let i = 1; i <= totalVerNo; i++) {
      const subAddr = await broadcastContract.getBroadcastContractByIndex(i);
      console.log(`[${i}] ${subAddr}${i == activeVer ? ' (ACTIVE)' : ''}`);
    }
    
    // Get current version details
    const currentVersionAddr = await broadcastContract.getCurrentVersion();
    console.log(`\nCurrent Version Address: ${currentVersionAddr}`);
  } else {
    console.log('\nNo sub-contracts created yet.');
  }
}

async function viewPublicContract(address) {
  console.log('\n----- PublicContract Data -----');
  
  const publicContract = await ethers.getContractAt('PublicContract', address);
  
  // Basic info
  const owner = await publicContract.owner();
  const user = await publicContract.user();
  const title = await publicContract.title();
  const totalVerNo = await publicContract.totalVerNo();
  const activeVer = await publicContract.activeVer();
  
  console.log(`Owner: ${owner}`);
  console.log(`User: ${user === ZERO_ADDRESS ? 'Not activated' : user}`);
  console.log(`Title: ${title}`);
  console.log(`Total Versions: ${totalVerNo}`);
  console.log(`Active Version: ${activeVer}`);
  
  // Get all sub-contracts
  if (totalVerNo > 0) {
    console.log('\nAll Sub-contracts:');
    for (let i = 1; i <= totalVerNo; i++) {
      const subAddr = await publicContract.getPublicContractByIndex(i);
      console.log(`[${i}] ${subAddr}${i == activeVer ? ' (ACTIVE)' : ''}`);
    }
    
    // Get current version details
    const currentVersionAddr = await publicContract.getCurrentVersion();
    console.log(`\nCurrent Version Address: ${currentVersionAddr}`);
  } else {
    console.log('\nNo sub-contracts created yet.');
  }
}

async function viewPrivateContract(address) {
  console.log('\n----- PrivateContract Data -----');
  
  const privateContract = await ethers.getContractAt('PrivateContract', address);
  
  // Basic info
  const owner = await privateContract.owner();
  const user = await privateContract.user();
  const title = await privateContract.title();
  const totalVerNo = await privateContract.totalVerNo();
  const activeVer = await privateContract.activeVer();
  
  console.log(`Owner: ${owner}`);
  console.log(`User: ${user === ZERO_ADDRESS ? 'Not activated' : user}`);
  console.log(`Title: ${title}`);
  console.log(`Total Versions: ${totalVerNo}`);
  console.log(`Active Version: ${activeVer}`);
  
  // Get all sub-contracts
  if (totalVerNo > 0) {
    console.log('\nAll Sub-contracts:');
    for (let i = 1; i <= totalVerNo; i++) {
      const subAddr = await privateContract.getPrivateContractByIndex(i);
      console.log(`[${i}] ${subAddr}${i == activeVer ? ' (ACTIVE)' : ''}`);
    }
    
    // Get current version details
    const currentVersionAddr = await privateContract.getCurrentVersion();
    console.log(`\nCurrent Version Address: ${currentVersionAddr}`);
  } else {
    console.log('\nNo sub-contracts created yet.');
  }
}

async function viewBroadcastSubContract(address) {
  console.log('\n----- BroadcastSubContract Data -----');
  
  const subContract = await ethers.getContractAt('BroadcastSubContract', address);
  
  // Get all details
  const details = await subContract.getDetail();
  
  console.log(`Parent Contract: ${details[0]}`);
  console.log(`Owner: ${details[1]}`);
  console.log(`Status: ${details[2] === 0 ? 'Active' : 'Disabled'}`);
  console.log(`Version: ${details[3]}`);
  console.log(`JSON Hash: ${details[4]}`);
  console.log(`SoftCopy Hash: ${details[5]}`);
  console.log(`Storage Link: ${details[6]}`);
  console.log(`Start Date: ${new Date(Number(details[7]) * 1000).toLocaleString()}`);
  console.log(`End Date: ${new Date(Number(details[8]) * 1000).toLocaleString()}`);
  console.log(`Deploy Time: ${new Date(Number(details[9]) * 1000).toLocaleString()}`);
}

async function viewPublicSubContract(address) {
  console.log('\n----- PublicSubContract Data -----');
  
  const subContract = await ethers.getContractAt('PublicSubContract', address);
  
  // Get all details
  const details = await subContract.getDetail();
  
  console.log(`Parent Contract: ${details[0]}`);
  console.log(`Owner: ${details[1]}`);
  console.log(`Parent Address: ${details[2]}`);
  console.log(`User: ${details[3] === ZERO_ADDRESS ? 'Not activated' : details[3]}`);
  console.log(`Status: ${details[4] === 0 ? 'Active' : 'Disabled'}`);
  console.log(`Version: ${details[5]}`);
  console.log(`JSON Hash: ${details[6]}`);
  console.log(`SoftCopy Hash: ${details[7]}`);
  console.log(`Storage Link: ${details[8]}`);
  console.log(`Start Date: ${new Date(Number(details[9]) * 1000).toLocaleString()}`);
  console.log(`End Date: ${new Date(Number(details[10]) * 1000).toLocaleString()}`);
  console.log(`Deploy Time: ${new Date(Number(details[11]) * 1000).toLocaleString()}`);
}

async function viewPrivateSubContract(address) {
  console.log('\n----- PrivateSubContract Data -----');
  
  const subContract = await ethers.getContractAt('PrivateSubContract', address);
  
  // Get all details
  const details = await subContract.getDetail();
  
  console.log(`Parent Contract: ${details[0]}`);
  console.log(`Owner: ${details[1]}`);
  console.log(`Parent Address: ${details[2]}`);
  console.log(`User: ${details[3] === ZERO_ADDRESS ? 'Not activated' : details[3]}`);
  console.log(`Status: ${details[4] === 0 ? 'Active' : 'Disabled'}`);
  console.log(`Version: ${details[5]}`);
  console.log(`JSON Hash: ${details[6]}`);
  console.log(`SoftCopy Hash: ${details[7]}`);
  console.log(`JSON Link: ${details[8] || 'Not set'}`);
  console.log(`SoftCopy Link: ${details[9] || 'Not set'}`);
  console.log(`Start Date: ${new Date(Number(details[10]) * 1000).toLocaleString()}`);
  console.log(`End Date: ${new Date(Number(details[11]) * 1000).toLocaleString()}`);
  console.log(`Deploy Time: ${new Date(Number(details[12]) * 1000).toLocaleString()}`);
}

function promptQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// Execute the script if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error running view script:', error);
      process.exit(1);
    });
}

module.exports = { main };
