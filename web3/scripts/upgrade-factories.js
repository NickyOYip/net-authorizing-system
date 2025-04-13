const { ethers, network } = require("hardhat");
const fs = require('fs');
const path = require('path');
const { saveDeployment } = require('./save-deployment');

async function main() {
  console.log(`Upgrading factories on ${network.name}...`);
  
  // Get the signer (deployer)
  const [deployer] = await ethers.getSigners();
  console.log(`Upgrading contracts with the account: ${deployer.address}`);
  console.log(`Account balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
  
  // Get the deployment addresses
  const deploymentPath = path.join(__dirname, '../deployments', `${network.name}.json`);
  if (!fs.existsSync(deploymentPath)) {
    console.error(`No deployment found for network ${network.name}`);
    process.exit(1);
  }
  
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  console.log("Found existing deployment:", deploymentData);
  
  // Ask which factory to upgrade
  const factoryType = process.argv[2] || await promptFactoryType();
  
  // Deploy the new factory version
  const newFactoryAddr = await upgradeFactory(factoryType, deployer, deploymentData);
  
  // Save the updated deployment information
  saveDeployment({
    ...deploymentData,
    [`${factoryType}Factory`]: newFactoryAddr,
    lastUpgraded: {
      type: factoryType,
      address: newFactoryAddr,
      timestamp: new Date().toISOString()
    }
  }, network.name);
  
  console.log("\nUpgrade completed successfully!");
}

async function promptFactoryType() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    readline.question('Which factory do you want to upgrade? (broadcast/public/private): ', (answer) => {
      readline.close();
      if (!['broadcast', 'public', 'private'].includes(answer.toLowerCase())) {
        console.error('Invalid factory type. Please choose broadcast, public, or private.');
        process.exit(1);
      }
      resolve(answer.toLowerCase());
    });
  });
}

async function upgradeFactory(factoryType, deployer, deploymentData) {
  const masterFactoryAddr = deploymentData.masterFactory;
  
  // Get contract factories
  const MasterFactory = await ethers.getContractFactory("MasterFactory");
  const masterFactory = MasterFactory.attach(masterFactoryAddr);
  
  // Check if deployer is owner of master factory
  const masterFactoryOwner = await masterFactory.owner();
  if (masterFactoryOwner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error(`Deployer is not the owner of the MasterFactory. Owner is ${masterFactoryOwner}`);
    process.exit(1);
  }
  
  let factoryContract;
  let addVerFn;
  let currentVerFn;

  // Deploy new factory version based on type
  if (factoryType === 'broadcast') {
    console.log("Deploying new BroadcastFactory version...");
    const BroadcastFactory = await ethers.getContractFactory("BroadcastFactory");
    factoryContract = await BroadcastFactory.deploy();
    addVerFn = masterFactory.addBroadcastFactoryVer;
    currentVerFn = masterFactory.broadcastFactoryCurrentVer;
  } else if (factoryType === 'public') {
    console.log("Deploying new PublicFactory version...");
    const PublicFactory = await ethers.getContractFactory("PublicFactory");
    factoryContract = await PublicFactory.deploy();
    addVerFn = masterFactory.addPublicFactoryVer;
    currentVerFn = masterFactory.publicFactoryCurrentVer;
  } else if (factoryType === 'private') {
    console.log("Deploying new PrivateFactory version...");
    const PrivateFactory = await ethers.getContractFactory("PrivateFactory");
    factoryContract = await PrivateFactory.deploy();
    addVerFn = masterFactory.addPrivateFactoryVer;
    currentVerFn = masterFactory.privateFactoryCurrentVer;
  } else {
    console.error('Invalid factory type');
    process.exit(1);
  }
  
  await factoryContract.deployed();
  console.log(`New ${factoryType}Factory deployed at: ${factoryContract.address}`);
  
  // Register the new factory with the master factory
  console.log(`Registering new ${factoryType}Factory with MasterFactory...`);
  let tx;
  
  if (factoryType === 'broadcast') {
    tx = await masterFactory.addBroadcastFactoryVer(factoryContract.address);
  } else if (factoryType === 'public') {
    tx = await masterFactory.addPublicFactoryVer(factoryContract.address);
  } else if (factoryType === 'private') {
    tx = await masterFactory.addPrivateFactoryVer(factoryContract.address);
  }
  
  await tx.wait();
  console.log(`New ${factoryType}Factory registered with MasterFactory`);
  
  // Get the current version number
  let currentVer;
  if (factoryType === 'broadcast') {
    currentVer = await masterFactory.broadcastFactoryCurrentVer();
  } else if (factoryType === 'public') {
    currentVer = await masterFactory.publicFactoryCurrentVer();
  } else if (factoryType === 'private') {
    currentVer = await masterFactory.privateFactoryCurrentVer();
  }
  
  console.log(`Current version before update: ${currentVer}`);
  
  // Update the current version to the new one
  console.log(`Updating current ${factoryType}Factory version...`);
  
  const newVersionIndex = Number(currentVer) + 1;
  if (factoryType === 'broadcast') {
    tx = await masterFactory.updateBroadcastFactoryVer(newVersionIndex);
  } else if (factoryType === 'public') {
    tx = await masterFactory.updatePublicFactoryVer(newVersionIndex);
  } else if (factoryType === 'private') {
    tx = await masterFactory.updatePrivateFactoryVer(newVersionIndex);
  }
  
  await tx.wait();
  console.log(`${factoryType}Factory version updated to: ${newVersionIndex}`);
  
  return factoryContract.address;
}

// Execute the upgrade
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during upgrade:", error);
    process.exit(1);
  });
