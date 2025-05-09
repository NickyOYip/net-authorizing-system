const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment of factory contracts...");
  
  // Get the signer (deployer)
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  
  // Get contract factories
  const MasterFactory = await ethers.getContractFactory("MasterFactory");
  const BroadcastFactory = await ethers.getContractFactory("BroadcastFactory");
  const PublicFactory = await ethers.getContractFactory("PublicFactory");
  const PrivateFactory = await ethers.getContractFactory("PrivateFactory");
  
  // Deploy the individual factories first
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
  
  // Now deploy the master factory
  console.log("Deploying MasterFactory...");
  const masterFactory = await MasterFactory.deploy();
  await masterFactory.deployed();
  console.log(`MasterFactory deployed to: ${masterFactory.address}`);
  
  // Register the factories with the master factory
  console.log("Registering factories with MasterFactory...");
  
  // Add broadcast factory
  let tx = await masterFactory.addBroadcastFactoryVer(broadcastFactory.address);
  await tx.wait();
  console.log("BroadcastFactory registered and set as current version");
  
  // Add public factory
  tx = await masterFactory.addPublicFactoryVer(publicFactory.address);
  await tx.wait();
  console.log("PublicFactory registered and set as current version");
  
  // Add private factory
  tx = await masterFactory.addPrivateFactoryVer(privateFactory.address);
  await tx.wait();
  console.log("PrivateFactory registered and set as current version");
  
  // Update versions to 0 (first version)
  tx = await masterFactory.updateBroadcastFactoryVer(0);
  await tx.wait();
  
  tx = await masterFactory.updatePublicFactoryVer(0);
  await tx.wait();
  
  tx = await masterFactory.updatePrivateFactoryVer(0);
  await tx.wait();
  
  console.log("All factories registered and set to version 0");
  
  // Verify current versions
  const currentVersions = await masterFactory.getCurrentVer();
  console.log(`Current BroadcastFactory: ${currentVersions[0]}`);
  console.log(`Current PublicFactory: ${currentVersions[1]}`);
  console.log(`Current PrivateFactory: ${currentVersions[2]}`);
  
  console.log("\nDeployment completed successfully!");
  
  // Return all the deployed contract addresses for verification
  return {
    masterFactoryAddress: masterFactory.address,
    broadcastFactoryAddress: broadcastFactory.address,
    publicFactoryAddress: publicFactory.address,
    privateFactoryAddress: privateFactory.address
  };
}

// Execute the deployment
main()
  .then((deployedContracts) => {
    console.log("\nDeployment Summary:");
    console.log("------------------");
    console.log(`MasterFactory: ${deployedContracts.masterFactoryAddress}`);
    console.log(`BroadcastFactory: ${deployedContracts.broadcastFactoryAddress}`);
    console.log(`PublicFactory: ${deployedContracts.publicFactoryAddress}`);
    console.log(`PrivateFactory: ${deployedContracts.privateFactoryAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
