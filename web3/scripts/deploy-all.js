const { ethers, network, run } = require("hardhat");
const { saveDeployment } = require('./save-deployment');

// Add a delay function to wait before verification
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Add verification function
async function verifyContract(address, constructorArguments = []) {
  if (network.name === 'hardhat' || network.name === 'localhost') {
    console.log('Skipping verification on local network');
    return;
  }
  
  console.log(`\nVerifying contract at ${address}...`);
  try {
    // Wait to give the block explorer time to index the contract
    console.log('Waiting for 30 seconds before verification...');
    await delay(30000);
    
    await run("verify:verify", {
      address,
      constructorArguments
    });
    console.log('Contract verified successfully');
  } catch (error) {
    console.log('Verification failed:', error.message);
    if (error.message.includes("doesn't recognize it as a supported chain")) {
      console.log(`\nTo verify contracts on ${network.name}:`);
      console.log('1. Make sure the customChains section in hardhat.config.js is configured correctly');
      console.log('2. Ensure you have the correct API key for this network\'s block explorer');
      console.log('3. Check that the block explorer API URL is correct and accessible');
    }
  }
}

async function main() {
  console.log(`Deploying contracts to ${network.name}...`);
  
  // Get the signer (deployer)
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  
  // Skip balance display as it's causing issues
  // console.log(`Account balance: ${formattedBalance} ETH`);
  
  // Deploy factories
  const factories = await deployFactories(deployer);
  
  // Verify contracts if on a supported network
  if (network.name !== 'hardhat' && network.name !== 'localhost') {
    console.log("\nStarting contract verification...");
    await verifyContract(factories.masterFactory);
    await verifyContract(factories.broadcastFactory);
    await verifyContract(factories.publicFactory);
    await verifyContract(factories.privateFactory);
  }
  
  // Save all deployment addresses
  saveDeployment(factories, network.name);
  
  console.log("\nDeployment completed successfully!");
  return factories;
}

async function deployFactories(deployer) {
  try {
    // Get contract factories
    const MasterFactory = await ethers.getContractFactory("MasterFactory");
    const BroadcastFactory = await ethers.getContractFactory("BroadcastFactory");
    const PublicFactory = await ethers.getContractFactory("PublicFactory");
    const PrivateFactory = await ethers.getContractFactory("PrivateFactory");
    
    // Deploy the master factory first
    console.log("\nDeploying MasterFactory...");
    const masterFactory = await MasterFactory.deploy();
    console.log("Waiting for MasterFactory deployment...");
    
    // Handle different ethers.js versions
    if (typeof masterFactory.deployed === 'function') {
      await masterFactory.deployed();
    } else if (typeof masterFactory.waitForDeployment === 'function') {
      await masterFactory.waitForDeployment();
    } else {
      // Wait for transaction confirmation as fallback
      const tx = await masterFactory.deployTransaction.wait();
      console.log(`MasterFactory transaction confirmed in block ${tx.blockNumber}`);
    }
    
    const masterFactoryAddress = typeof masterFactory.address === 'string' ? 
      masterFactory.address : 
      await masterFactory.getAddress?.() || masterFactory.target;
      
    console.log(`MasterFactory deployed to: ${masterFactoryAddress}`);
    
    // Deploy the individual factories
    console.log("\nDeploying individual factories...");
    
    console.log("Deploying BroadcastFactory...");
    const broadcastFactory = await BroadcastFactory.deploy();
    
    if (typeof broadcastFactory.deployed === 'function') {
      await broadcastFactory.deployed();
    } else if (typeof broadcastFactory.waitForDeployment === 'function') {
      await broadcastFactory.waitForDeployment();
    }
    
    const broadcastFactoryAddress = typeof broadcastFactory.address === 'string' ? 
      broadcastFactory.address : 
      await broadcastFactory.getAddress?.() || broadcastFactory.target;
      
    console.log(`BroadcastFactory deployed to: ${broadcastFactoryAddress}`);
    
    console.log("Deploying PublicFactory...");
    const publicFactory = await PublicFactory.deploy();
    
    if (typeof publicFactory.deployed === 'function') {
      await publicFactory.deployed();
    } else if (typeof publicFactory.waitForDeployment === 'function') {
      await publicFactory.waitForDeployment();
    }
    
    const publicFactoryAddress = typeof publicFactory.address === 'string' ? 
      publicFactory.address : 
      await publicFactory.getAddress?.() || publicFactory.target;
      
    console.log(`PublicFactory deployed to: ${publicFactoryAddress}`);
    
    console.log("Deploying PrivateFactory...");
    const privateFactory = await PrivateFactory.deploy();
    
    if (typeof privateFactory.deployed === 'function') {
      await privateFactory.deployed();
    } else if (typeof privateFactory.waitForDeployment === 'function') {
      await privateFactory.waitForDeployment();
    }
    
    const privateFactoryAddress = typeof privateFactory.address === 'string' ? 
      privateFactory.address : 
      await privateFactory.getAddress?.() || privateFactory.target;
      
    console.log(`PrivateFactory deployed to: ${privateFactoryAddress}`);
    
    // Register factories with the master factory
    console.log("\nRegistering factories with MasterFactory...");
    
    // Add broadcast factory
    let tx = await masterFactory.addBroadcastFactoryVer(broadcastFactoryAddress);
    await tx.wait();
    console.log("BroadcastFactory registered with MasterFactory");
    
    // Add public factory
    tx = await masterFactory.addPublicFactoryVer(publicFactoryAddress);
    await tx.wait();
    console.log("PublicFactory registered with MasterFactory");
    
    // Add private factory
    tx = await masterFactory.addPrivateFactoryVer(privateFactoryAddress);
    await tx.wait();
    console.log("PrivateFactory registered with MasterFactory");
    
    // Set all factories to version 0 (first version)
    console.log("\nSetting current versions...");
    
    tx = await masterFactory.updateBroadcastFactoryVer(0);
    await tx.wait();
    console.log("BroadcastFactory set as current version (0)");
    
    tx = await masterFactory.updatePublicFactoryVer(0);
    await tx.wait();
    console.log("PublicFactory set as current version (0)");
    
    tx = await masterFactory.updatePrivateFactoryVer(0);
    await tx.wait();
    console.log("PrivateFactory set as current version (0)");
    
    // Return deployed contract addresses
    return {
      masterFactory: masterFactoryAddress,
      broadcastFactory: broadcastFactoryAddress,
      publicFactory: publicFactoryAddress,
      privateFactory: privateFactoryAddress,
      deployedBy: deployer.address,
      deployedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in deployFactories:", error);
    throw error;
  }
}

// Execute the deployment
main()
  .then((deployedContracts) => {
    console.log("\nDeployment Summary:");
    console.log("------------------");
    console.log(`MasterFactory: ${deployedContracts.masterFactory}`);
    console.log(`BroadcastFactory: ${deployedContracts.broadcastFactory}`);
    console.log(`PublicFactory: ${deployedContracts.publicFactory}`);
    console.log(`PrivateFactory: ${deployedContracts.privateFactory}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
