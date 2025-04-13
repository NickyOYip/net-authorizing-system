const { ethers, network } = require("hardhat");
const { saveDeployment } = require('./save-deployment');

async function main() {
  console.log(`Deploying contracts to ${network.name}...`);
  
  // Get the signer (deployer)
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(`Account balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
  
  // Deploy factories
  const factories = await deployFactories(deployer);
  
  // Save all deployment addresses
  saveDeployment(factories, network.name);
  
  console.log("\nDeployment completed successfully!");
  return factories;
}

async function deployFactories(deployer) {
  // Get contract factories
  const MasterFactory = await ethers.getContractFactory("MasterFactory");
  const BroadcastFactory = await ethers.getContractFactory("BroadcastFactory");
  const PublicFactory = await ethers.getContractFactory("PublicFactory");
  const PrivateFactory = await ethers.getContractFactory("PrivateFactory");
  
  // Deploy the master factory first
  console.log("\nDeploying MasterFactory...");
  const masterFactory = await MasterFactory.deploy();
  await masterFactory.deployed();
  console.log(`MasterFactory deployed to: ${masterFactory.address}`);
  
  // Deploy the individual factories
  console.log("\nDeploying individual factories...");
  
  console.log("Deploying BroadcastFactory...");
  const broadcastFactory = await BroadcastFactory.deploy();
  await broadcastFactory.deployed();
  console.log(`BroadcastFactory deployed to: ${broadcastFactory.address}`);
  
  console.log("Deploying PublicFactory...");
  const publicFactory = await PublicFactory.deploy();
  await publicFactory.deployed();
  console.log(`PublicFactory deployed to: ${publicFactory.address}`);
  
  console.log("Deploying PrivateFactory...");
  const privateFactory = await PrivateFactory.deploy();
  await privateFactory.deployed();
  console.log(`PrivateFactory deployed to: ${privateFactory.address}`);
  
  // Register factories with the master factory
  console.log("\nRegistering factories with MasterFactory...");
  
  // Add broadcast factory
  let tx = await masterFactory.addBroadcastFactoryVer(broadcastFactory.address);
  await tx.wait();
  console.log("BroadcastFactory registered with MasterFactory");
  
  // Add public factory
  tx = await masterFactory.addPublicFactoryVer(publicFactory.address);
  await tx.wait();
  console.log("PublicFactory registered with MasterFactory");
  
  // Add private factory
  tx = await masterFactory.addPrivateFactoryVer(privateFactory.address);
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
    masterFactory: masterFactory.address,
    broadcastFactory: broadcastFactory.address,
    publicFactory: publicFactory.address,
    privateFactory: privateFactory.address,
    deployedBy: deployer.address,
    deployedAt: new Date().toISOString()
  };
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
