const { ethers, network } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log(`Testing MasterFactory on ${network.name}...`);
  
  // Get the latest deployment address from the deployment file
  const networkDir = path.join(__dirname, '../deployments', network.name);
  const latestFile = path.join(networkDir, 'latest.json');
  
  if (!fs.existsSync(latestFile)) {
    console.error(`No deployment found for network ${network.name}`);
    console.error(`Please run deploy-all.js first, or specify the master factory address as an argument`);
    process.exit(1);
  }
  
  // Read deployment data
  const deploymentData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
  const masterFactoryAddress = deploymentData.masterFactory || process.argv[2];
  
  if (!masterFactoryAddress) {
    console.error("Master factory address not found in deployment data");
    process.exit(1);
  }
  
  console.log(`Using MasterFactory at: ${masterFactoryAddress}`);
  
  // Connect to the MasterFactory contract
  try {
    const MasterFactory = await ethers.getContractFactory("MasterFactory");
    const masterFactory = MasterFactory.attach(masterFactoryAddress);
    
    // Test the getCurrentVer function
    console.log("\nCalling getCurrentVer()...");
    const currentVersions = await masterFactory.getCurrentVer();
    
    console.log("\nCurrent Factory Versions:");
    console.log("-----------------------");
    console.log(`BroadcastFactory: ${currentVersions[0]}`);
    console.log(`PublicFactory: ${currentVersions[1]}`);
    console.log(`PrivateFactory: ${currentVersions[2]}`);
    
    // Get more info about the master factory
    const owner = await masterFactory.owner();
    console.log(`\nMasterFactory owner: ${owner}`);
    
    // Get version numbers
    const broadcastVer = await masterFactory.broadcastFactoryCurrentVer();
    const publicVer = await masterFactory.publicFactoryCurrentVer();
    const privateVer = await masterFactory.privateFactoryCurrentVer();
    
    console.log("\nCurrent Version Numbers:");
    console.log("-----------------------");
    console.log(`Broadcast: Version ${broadcastVer}`);
    console.log(`Public: Version ${publicVer}`);
    console.log(`Private: Version ${privateVer}`);
    
    // Get all versions
    const allVersions = await masterFactory.getAllVer();
    
    console.log("\nAll Factory Versions:");
    console.log("-------------------");
    
    console.log("BroadcastFactory versions:");
    for (let i = 0; i < allVersions[0].length; i++) {
      console.log(`  Version ${i}: ${allVersions[0][i]}`);
    }
    
    console.log("\nPublicFactory versions:");
    for (let i = 0; i < allVersions[1].length; i++) {
      console.log(`  Version ${i}: ${allVersions[1][i]}`);
    }
    
    console.log("\nPrivateFactory versions:");
    for (let i = 0; i < allVersions[2].length; i++) {
      console.log(`  Version ${i}: ${allVersions[2][i]}`);
    }
    
    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Error testing MasterFactory:", error);
    process.exit(1);
  }
}

// Execute the test
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
