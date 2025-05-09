const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Helper function to pause execution for a specified time
 * @param {number} ms - Time to pause in milliseconds
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Load the latest deployment addresses from the JSON file for the current network
 * @returns {Object} The deployment addresses
 */
function loadDeployment() {
  const networkName = network.name;
  const deploymentPath = path.join(__dirname, '../deployments', networkName, 'latest.json');
  
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`No deployment found for network ${networkName}`);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  return deployment;
}

/**
 * Test the MasterFactory contract
 * @param {Object} deployment - The deployment addresses
 * @param {ethers.Signer} signer - The signer to use
 */
async function testMasterFactory(deployment, signer) {
  console.log("\n🧪 Testing MasterFactory contract...");
  
  // Get signer address (compatible with ethers v5 and v6)
  const signerAddress = typeof signer.address === 'string' 
    ? signer.address 
    : await signer.getAddress?.() || signer.address;
  
  console.log(`   ✓ Using signer: ${signerAddress}`);
  
  // Connect to the MasterFactory contract
  const MasterFactory = await ethers.getContractFactory("MasterFactory");
  const masterFactory = MasterFactory.attach(deployment.masterFactory);
  
  // Test basic functions
  console.log("   ✓ Getting current versions...");
  const currentVers = await masterFactory.getCurrentVer();
  console.log(`     → Broadcast Factory: ${currentVers[0]}`);
  console.log(`     → Public Factory: ${currentVers[1]}`);
  console.log(`     → Private Factory: ${currentVers[2]}`);
  
  // Compare with our deployment file
  if (currentVers[0].toLowerCase() === deployment.broadcastFactory.toLowerCase() &&
      currentVers[1].toLowerCase() === deployment.publicFactory.toLowerCase() &&
      currentVers[2].toLowerCase() === deployment.privateFactory.toLowerCase()) {
    console.log("   ✅ Factory addresses match deployment file!");
  } else {
    console.log("   ❌ Factory addresses don't match deployment file!");
  }
  
  return masterFactory;
}

/**
 * Test the BroadcastFactory contract and create a broadcast contract
 * @param {Object} deployment - The deployment addresses
 * @param {ethers.Signer} signer - The signer to use
 * @returns {Promise<Object>} The created broadcast contract and its address
 */
async function testBroadcastFactory(deployment, signer) {
  console.log("\n🧪 Testing BroadcastFactory contract...");
  
  // Get signer address (compatible with ethers v5 and v6)
  const signerAddress = typeof signer.address === 'string' 
    ? signer.address 
    : await signer.getAddress?.() || signer.address;
  
  console.log(`   ✓ Using signer: ${signerAddress}`);
  
  // Connect to the BroadcastFactory contract
  const BroadcastFactory = await ethers.getContractFactory("BroadcastFactory");
  const broadcastFactory = BroadcastFactory.attach(deployment.broadcastFactory);
  
  // Create a new broadcast contract
  const title = `Test Certificate ${Date.now()}`;
  console.log(`   ✓ Creating a new broadcast contract with title: "${title}"...`);
  
  const tx = await broadcastFactory.createBroadcastContract(title);
  console.log(`     → Transaction hash: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`     → Transaction confirmed in block ${receipt.blockNumber}`);
  
  // Get all broadcast contracts
  const contracts = await broadcastFactory.getAllBroadcastContracts();
  console.log(`     → Total broadcast contracts: ${contracts.length}`);
  
  // Get the created contract address
  const contractAddress = contracts[contracts.length - 1];
  console.log(`     → Created contract address: ${contractAddress}`);
  
  // Connect to the created contract
  const BroadcastContract = await ethers.getContractFactory("BroadcastContract");
  const broadcastContract = BroadcastContract.attach(contractAddress);
  
  // Verify contract owner and title
  const contractOwner = await broadcastContract.owner();
  const contractTitle = await broadcastContract.title();
  
  console.log(`     → Contract owner: ${contractOwner}`);
  console.log(`     → Contract title: ${contractTitle}`);
  
  if (contractOwner.toLowerCase() === signerAddress.toLowerCase() && contractTitle === title) {
    console.log("   ✅ Contract created successfully!");
  } else {
    console.log("   ❌ Contract creation failed or data doesn't match!");
  }
  
  return { contract: broadcastContract, address: contractAddress };
}

/**
 * Test creating a sub-contract in a broadcast contract
 * @param {ethers.Contract} broadcastContract - The broadcast contract
 * @param {ethers.Signer} signer - The signer to use
 * @returns {Promise<Object>} The created sub-contract address
 */
async function testBroadcastSubContract(broadcastContract, signer) {
  console.log("\n🧪 Testing BroadcastContract sub-contract creation...");
  
  // Get signer address (compatible with ethers v5 and v6)
  const signerAddress = typeof signer.address === 'string' 
    ? signer.address 
    : await signer.getAddress?.() || signer.address;
  
  console.log(`   ✓ Using signer: ${signerAddress}`);
  
  // Create a new sub-contract
  const jsonHash = "0x123abc456def789ghi";
  const softCopyHash = "0xabcdef123456789";
  const storageLink = "ar://txid" + Date.now();
  const startDate = Math.floor(Date.now() / 1000);
  const endDate = startDate + 31536000; // +1 year
  
  console.log(`   ✓ Creating a new sub-contract...`);
  console.log(`     → JSON Hash: ${jsonHash}`);
  console.log(`     → Soft Copy Hash: ${softCopyHash}`);
  console.log(`     → Storage Link: ${storageLink}`);
  console.log(`     → Start Date: ${new Date(startDate * 1000).toISOString()}`);
  console.log(`     → End Date: ${new Date(endDate * 1000).toISOString()}`);
  
  const tx = await broadcastContract.addNewBroadcastSubContract(
    jsonHash,
    softCopyHash,
    storageLink,
    startDate,
    endDate
  );
  console.log(`     → Transaction hash: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`     → Transaction confirmed in block ${receipt.blockNumber}`);
  
  // Get all sub-contracts
  const subContracts = await broadcastContract.getAllBroadcastSubContracts();
  console.log(`     → Total sub-contracts: ${subContracts.length}`);
  
  // Get the created sub-contract address
  const subContractAddress = subContracts[subContracts.length - 1];
  console.log(`     → Created sub-contract address: ${subContractAddress}`);
  
  // Connect to the created sub-contract
  const BroadcastSubContract = await ethers.getContractFactory("BroadcastSubContract");
  const subContract = BroadcastSubContract.attach(subContractAddress);
  
  // Verify sub-contract data
  const subContractData = await subContract.getDetail();
  console.log(`     → Sub-contract parent: ${subContractData[0]}`);
  console.log(`     → Sub-contract owner: ${subContractData[1]}`);
  console.log(`     → Sub-contract status: ${subContractData[2]}`);
  console.log(`     → Sub-contract version: ${subContractData[3]}`);
  console.log(`     → Sub-contract JSON hash: ${subContractData[4]}`);
  console.log(`     → Sub-contract soft copy hash: ${subContractData[5]}`);
  console.log(`     → Sub-contract storage link: ${subContractData[6]}`);
  
  if (subContractData[0].toLowerCase() === broadcastContract.address.toLowerCase() &&
      subContractData[1].toLowerCase() === signerAddress.toLowerCase() &&
      subContractData[4] === jsonHash &&
      subContractData[5] === softCopyHash &&
      subContractData[6] === storageLink) {
    console.log("   ✅ Sub-contract created successfully!");
  } else {
    console.log("   ❌ Sub-contract creation failed or data doesn't match!");
  }
  
  return { address: subContractAddress, subContract };
}

/**
 * Test the PublicFactory contract and create a public contract
 * @param {Object} deployment - The deployment addresses
 * @param {ethers.Signer} signer - The signer to use
 * @returns {Promise<Object>} The created public contract, its address, and activation code
 */
async function testPublicFactory(deployment, signer) {
  console.log("\n🧪 Testing PublicFactory contract...");
  
  // Get signer address (compatible with ethers v5 and v6)
  const signerAddress = typeof signer.address === 'string' 
    ? signer.address 
    : await signer.getAddress?.() || signer.address;
  
  console.log(`   ✓ Using signer: ${signerAddress}`);
  
  // Connect to the PublicFactory contract
  const PublicFactory = await ethers.getContractFactory("PublicFactory");
  const publicFactory = PublicFactory.attach(deployment.publicFactory);
  
  // Create a new public contract
  const title = `Test Public Certificate ${Date.now()}`;
  const activationCode = `secret${Date.now()}`; // Generate a unique activation code
  console.log(`   ✓ Creating a new public contract with title: "${title}" and activation code: "${activationCode}"...`);
  
  const tx = await publicFactory.createPublicContract(title, activationCode);
  console.log(`     → Transaction hash: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`     → Transaction confirmed in block ${receipt.blockNumber}`);
  
  // Get all public contracts
  const contracts = await publicFactory.getAllPublicContracts();
  console.log(`     → Total public contracts: ${contracts.length}`);
  
  // Get the created contract address
  const contractAddress = contracts[contracts.length - 1];
  console.log(`     → Created contract address: ${contractAddress}`);
  
  // Connect to the created contract
  const PublicContract = await ethers.getContractFactory("PublicContract");
  const publicContract = PublicContract.attach(contractAddress);
  
  // Verify contract owner and title
  const contractOwner = await publicContract.owner();
  const contractTitle = await publicContract.title();
  
  console.log(`     → Contract owner: ${contractOwner}`);
  console.log(`     → Contract title: ${contractTitle}`);
  
  if (contractOwner.toLowerCase() === signerAddress.toLowerCase() && contractTitle === title) {
    console.log("   ✅ Public contract created successfully!");
  } else {
    console.log("   ❌ Public contract creation failed or data doesn't match!");
  }
  
  return { contract: publicContract, address: contractAddress, activationCode };
}

/**
 * Test creating a sub-contract in a public contract
 * @param {ethers.Contract} publicContract - The public contract
 * @param {ethers.Signer} signer - The signer to use
 * @returns {Promise<Object>} The created sub-contract address
 */
async function testPublicSubContract(publicContract, signer) {
  console.log("\n🧪 Testing PublicContract sub-contract creation...");
  
  // Get signer address (compatible with ethers v5 and v6)
  const signerAddress = typeof signer.address === 'string' 
    ? signer.address 
    : await signer.getAddress?.() || signer.address;
  
  console.log(`   ✓ Using signer: ${signerAddress}`);
  
  // Create a new sub-contract
  const jsonHash = "0x123abc456def789ghi";
  const softCopyHash = "0xabcdef123456789";
  const storageLink = "ar://txid" + Date.now();
  const startDate = Math.floor(Date.now() / 1000);
  const endDate = startDate + 31536000; // +1 year
  
  console.log(`   ✓ Creating a new public sub-contract...`);
  console.log(`     → JSON Hash: ${jsonHash}`);
  console.log(`     → Soft Copy Hash: ${softCopyHash}`);
  console.log(`     → Storage Link: ${storageLink}`);
  console.log(`     → Start Date: ${new Date(startDate * 1000).toISOString()}`);
  console.log(`     → End Date: ${new Date(endDate * 1000).toISOString()}`);
  
  const tx = await publicContract.addNewPublicSubContract(
    jsonHash,
    softCopyHash,
    storageLink,
    startDate,
    endDate
  );
  console.log(`     → Transaction hash: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`     → Transaction confirmed in block ${receipt.blockNumber}`);
  
  // Get all sub-contracts
  const subContracts = await publicContract.getAllPublicSubContracts();
  console.log(`     → Total public sub-contracts: ${subContracts.length}`);
  
  // Get the created sub-contract address
  const subContractAddress = subContracts[subContracts.length - 1];
  console.log(`     → Created sub-contract address: ${subContractAddress}`);
  
  // Connect to the created sub-contract
  const PublicSubContract = await ethers.getContractFactory("PublicSubContract");
  const subContract = PublicSubContract.attach(subContractAddress);
  
  // Verify sub-contract data
  const subContractData = await subContract.getDetail();
  console.log(`     → Sub-contract parent: ${subContractData[2]}`);
  console.log(`     → Sub-contract owner: ${subContractData[1]}`);
  console.log(`     → Sub-contract status: ${subContractData[4]}`);
  console.log(`     → Sub-contract version: ${subContractData[5]}`);
  
  if (subContractData[2].toLowerCase() === publicContract.address.toLowerCase() &&
      subContractData[1].toLowerCase() === signerAddress.toLowerCase()) {
    console.log("   ✅ Public sub-contract created successfully!");
  } else {
    console.log("   ❌ Public sub-contract creation failed or data doesn't match!");
  }
  
  return { address: subContractAddress, subContract };
}

/**
 * Test contract activation and version management
 * @param {Object} publicContractInfo - The public contract info
 * @param {ethers.Signer} user - The user signer (different from the owner)
 */
async function testPublicContractActivation(publicContractInfo, user) {
  console.log("\n🧪 Testing Public Contract Activation...");
  
  const { contract: publicContract, activationCode } = publicContractInfo;
  
  // Get user address (compatible with ethers v5 and v6)
  const userAddress = typeof user.address === 'string' 
    ? user.address 
    : await user.getAddress?.() || user.address;
  
  console.log(`   ✓ Using user: ${userAddress}`);
  
  // Check initial user state (should be zero address)
  const initialUser = await publicContract.user();
  console.log(`   ✓ Initial user address: ${initialUser}`);
  
  // Activate contract as user
  console.log(`   ✓ Activating contract with user ${userAddress} and code "${activationCode}"...`);
  const tx = await publicContract.connect(user).activate(activationCode);
  console.log(`     → Transaction hash: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`     → Transaction confirmed in block ${receipt.blockNumber}`);
  
  // Check if user was updated correctly
  const updatedUser = await publicContract.user();
  console.log(`     → Updated user address: ${updatedUser}`);
  
  if (updatedUser.toLowerCase() === userAddress.toLowerCase()) {
    console.log("   ✅ Contract activation successful!");
  } else {
    console.log("   ❌ Contract activation failed!");
  }
  
  // Now add a second version of the sub-contract
  console.log("\n   ✓ Adding second version of sub-contract...");
  const jsonHash = "0x2ndversion" + Date.now();
  const softCopyHash = "0x2ndversion" + Date.now();
  const storageLink = "ar://txid2ndversion" + Date.now();
  const startDate = Math.floor(Date.now() / 1000);
  const endDate = startDate + 31536000; // +1 year
  
  const tx2 = await publicContract.addNewPublicSubContract(
    jsonHash,
    softCopyHash,
    storageLink,
    startDate,
    endDate
  );
  await tx2.wait();
  
  // Get all sub-contracts and the active version
  const subContracts = await publicContract.getAllPublicSubContracts();
  const activeVer = await publicContract.activeVer();
  
  console.log(`     → Total sub-contracts: ${subContracts.length}`);
  console.log(`     → Active version: ${activeVer}`);
  
  if (subContracts.length === 2 && activeVer.toString() === "2") {
    console.log("   ✅ Version management works correctly!");
  } else {
    console.log("   ❌ Version management failed!");
  }
  
  return { updatedContract: publicContract };
}

/**
 * Test private factory and contracts
 * @param {Object} deployment - The deployment addresses
 * @param {ethers.Signer} signer - The signer to use
 * @param {ethers.Signer} user - The user signer
 */
async function testPrivateFactory(deployment, signer, user) {
  console.log("\n🧪 Testing PrivateFactory contract...");
  
  // Get signer address (compatible with ethers v5 and v6)
  const signerAddress = typeof signer.address === 'string' 
    ? signer.address 
    : await signer.getAddress?.() || signer.address;
  
  console.log(`   ✓ Using signer: ${signerAddress}`);
  
  // Get user address (compatible with ethers v5 and v6)
  const userAddress = typeof user.address === 'string' 
    ? user.address 
    : await user.getAddress?.() || user.address;
  
  console.log(`   ✓ Using user: ${userAddress}`);
  
  // Connect to the PrivateFactory contract
  const PrivateFactory = await ethers.getContractFactory("PrivateFactory");
  const privateFactory = PrivateFactory.attach(deployment.privateFactory);
  
  // Create a new private contract
  const title = `Test Private Certificate ${Date.now()}`;
  const activationCode = `secret${Date.now()}`; // Generate a unique activation code
  console.log(`   ✓ Creating a new private contract with title: "${title}" and activation code: "${activationCode}"...`);
  
  const tx = await privateFactory.createPrivateContract(title, activationCode);
  console.log(`     → Transaction hash: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`     → Transaction confirmed in block ${receipt.blockNumber}`);
  
  // Get all private contracts
  const contracts = await privateFactory.getAllPrivateContracts();
  console.log(`     → Total private contracts: ${contracts.length}`);
  
  // Get the created contract address
  const contractAddress = contracts[contracts.length - 1];
  console.log(`     → Created private contract address: ${contractAddress}`);
  
  // Connect to the created contract
  const PrivateContract = await ethers.getContractFactory("PrivateContract");
  const privateContract = PrivateContract.attach(contractAddress);
  
  // Create a sub-contract
  const jsonHash = "0xprivate" + Date.now();
  const softCopyHash = "0xprivate" + Date.now();
  const startDate = Math.floor(Date.now() / 1000);
  const endDate = startDate + 31536000; // +1 year
  
  console.log(`   ✓ Creating a private sub-contract...`);
  const tx2 = await privateContract.addNewPrivateSubContract(
    jsonHash,
    softCopyHash,
    startDate,
    endDate
  );
  await tx2.wait();
  
  // Activate as user
  console.log(`   ✓ Activating private contract as user ${userAddress}...`);
  const tx3 = await privateContract.connect(user).activate(activationCode);
  await tx3.wait();
  
  // Check if user was updated correctly
  const updatedUser = await privateContract.user();
  console.log(`     → Updated user address: ${updatedUser}`);
  
  if (updatedUser.toLowerCase() === userAddress.toLowerCase()) {
    console.log("   ✅ Private contract activation successful!");
  } else {
    console.log("   ❌ Private contract activation failed!");
  }
  
  // Get the private sub-contract and update its data links
  const subContractAddr = await privateContract.getCurrentVersion();
  const PrivateSubContract = await ethers.getContractFactory("PrivateSubContract");
  const privateSubContract = PrivateSubContract.attach(subContractAddr);
  
  console.log(`   ✓ Updating data links as user...`);
  const jsonLink = "ar://encrypted-json-" + Date.now();
  const softCopyLink = "ar://encrypted-softcopy-" + Date.now();
  
  const tx4 = await privateSubContract.connect(user).updateDataLinks(jsonLink, softCopyLink);
  await tx4.wait();
  
  // Verify the data links were updated
  const details = await privateSubContract.getDetail();
  
  if (details[8] === jsonLink && details[9] === softCopyLink) {
    console.log("   ✅ Private sub-contract data links updated successfully!");
  } else {
    console.log("   ❌ Private sub-contract data links update failed!");
  }
  
  return { contract: privateContract, subContract: privateSubContract };
}

async function main() {
  try {
    // Check the network we're connected to
    console.log(`🌐 Connected to network: ${network.name}`);
    console.log('📋 Starting contract testing on testnet...');
    
    // Load deployment addresses
    const deployment = loadDeployment();
    console.log(`📝 Loaded deployment from ${network.name}:`);
    console.log(`    • MasterFactory: ${deployment.masterFactory}`);
    console.log(`    • BroadcastFactory: ${deployment.broadcastFactory}`);
    console.log(`    • PublicFactory: ${deployment.publicFactory}`);
    console.log(`    • PrivateFactory: ${deployment.privateFactory}`);
    
    // Get signers for testing - we need at least two accounts
    console.log("Getting signers...");
    const signers = await ethers.getSigners();
    
    if (!signers || signers.length < 2) {
      console.error("❌ Not enough signers found. Make sure your private keys are correctly configured.");
      console.log("Number of signers found:", signers?.length || 0);
      process.exit(1);
    }
    
    const deployer = signers[0];
    const user = signers[1];
    
    // Check if signers have addresses (handle different ethers versions)
    const deployerAddress = typeof deployer.address === 'string' 
      ? deployer.address 
      : await deployer.getAddress?.() || deployer.address;
      
    const userAddress = typeof user.address === 'string'
      ? user.address
      : await user.getAddress?.() || user.address;
    
    console.log(`👤 Using deployer account: ${deployerAddress}`);
    console.log(`👤 Using user account: ${userAddress}`);
    
    // Test MasterFactory
    await testMasterFactory(deployment, deployer);
    
    // Test BroadcastFactory & BroadcastContract
    const broadcastContractInfo = await testBroadcastFactory(deployment, deployer);
    const broadcastSubContractInfo = await testBroadcastSubContract(broadcastContractInfo.contract, deployer);
    
    // Test PublicFactory & PublicContract
    const publicContractInfo = await testPublicFactory(deployment, deployer);
    const publicSubContractInfo = await testPublicSubContract(publicContractInfo.contract, deployer);
    await testPublicContractActivation(publicContractInfo, user);
    
    // Test PrivateFactory & PrivateContract
    await testPrivateFactory(deployment, deployer, user);
    
    console.log("\n✅ All tests completed successfully!");
    
  } catch (error) {
    console.error("❌ Error during testing:", error);
    console.error("Error stack:", error.stack);
    process.exit(1);
  }
}

// Execute the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
