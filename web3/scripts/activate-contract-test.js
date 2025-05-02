const { ethers, network } = require("hardhat");
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log(`\n----- Contract Activation Test on ${network.name} -----\n`);
  
  // Verify we're on a testnet
  if (network.name === 'localhost' || network.name === 'hardhat') {
    console.error('This script should be run on a testnet network. Use --network sepolia');
    process.exit(1);
  }
  
  // Get signers
  const [deployer, user] = await ethers.getSigners();
  
  console.log(`Deployer account: ${deployer.address}`);
  console.log(`User account: ${user ? user.address : 'Not available'}`);
  
  if (!user) {
    console.warn('Warning: No user account available. Using deployer as user.');
  }
  
  const userAccount = user || deployer;
  
  // Ask for the contract type and address
  const contractType = await promptQuestion('Enter contract type (public/private): ');
  
  if (contractType.toLowerCase() !== 'public' && contractType.toLowerCase() !== 'private') {
    console.error('Invalid contract type. Use "public" or "private".');
    process.exit(1);
  }
  
  const contractAddress = await promptQuestion('Enter contract address: ');
  const activationCode = await promptQuestion('Enter activation code: ');
  
  console.log(`\nTesting ${contractType} contract activation...`);
  
  try {
    // Connect to the contract based on type
    const Contract = await ethers.getContractFactory(
      contractType.toLowerCase() === 'public' ? 'PublicContract' : 'PrivateContract'
    );
    
    const contract = await Contract.attach(contractAddress);
    
    // Check if contract is already activated
    const currentUser = await contract.user();
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    if (currentUser !== zeroAddress) {
      console.log(`Contract is already activated by: ${currentUser}`);
      process.exit(0);
    }
    
    // Get contract title
    const title = await contract.title();
    console.log(`Contract title: ${title}`);
    
    // Activate the contract
    console.log(`\nActivating as user: ${userAccount.address}`);
    const tx = await contract.connect(userAccount).activate(activationCode);
    console.log(`Transaction hash: ${tx.hash}`);
    
    console.log('Waiting for transaction confirmation...');
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Verify activation
    const newUser = await contract.user();
    console.log(`\nNew contract user: ${newUser}`);
    
    if (newUser.toLowerCase() === userAccount.address.toLowerCase()) {
      console.log('Activation successful! ✓');
    } else {
      console.warn(`Activation may have failed. Expected ${userAccount.address}, got ${newUser}`);
    }
    
    // Get current version
    const currentVersion = await contract.getCurrentVersion();
    console.log(`Current sub-contract version: ${currentVersion}`);
    
    // Verify user is also set on the sub-contract
    const SubContract = await ethers.getContractFactory(
      contractType.toLowerCase() === 'public' ? 'PublicSubContract' : 'PrivateSubContract'
    );
    
    const subContract = await SubContract.attach(currentVersion);
    const subContractUser = await subContract.user();
    console.log(`Sub-contract user: ${subContractUser}`);
    
    if (subContractUser.toLowerCase() === userAccount.address.toLowerCase()) {
      console.log('Sub-contract user set correctly! ✓');
    } else {
      console.warn(`Sub-contract user mismatch. Expected ${userAccount.address}, got ${subContractUser}`);
    }
    
  } catch (error) {
    console.error('Error during contract activation:', error.message);
    if (error.message.includes('Invalid activation code')) {
      console.error('The activation code provided is incorrect.');
    } else if (error.message.includes('already activated')) {
      console.error('This contract has already been activated.');
    } else {
      console.error('Full error:', error);
    }
  }
  
  rl.close();
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
      console.error('Error running activation test:', error);
      process.exit(1);
    });
}
