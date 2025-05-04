const { ethers, network, run } = require("hardhat");
const fs = require('fs');
const path = require('path');

// Add a delay function to wait before verification
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Add verification function
async function verifyContract(address, constructorArguments = []) {
  if (network.name === 'hardhat' || network.name === 'localhost') {
    console.log('Skipping verification on local network');
    return true;
  }
  
  console.log(`\nVerifying contract at ${address}...`);
  try {
    // Wait to give the block explorer time to index the contract
    console.log('Waiting for 10 seconds before verification...');
    await delay(10000);
    
    await run("verify:verify", {
      address,
      constructorArguments
    });
    console.log('Contract verified successfully');
    return true;
  } catch (error) {
    console.log('Verification failed:', error.message);
    if (error.message.includes("already verified")) {
      console.log('Contract is already verified');
      return true;
    }
    if (error.message.includes("doesn't recognize it as a supported chain")) {
      console.log(`\nTo verify contracts on ${network.name}:`);
      console.log('1. Make sure the customChains section in hardhat.config.js is configured correctly');
      console.log('2. Ensure you have the correct API key for this network\'s block explorer');
      console.log('3. Check that the block explorer API URL is correct and accessible');
    }
    return false;
  }
}

async function getDeployedFactories() {
  const deploymentsDir = path.join(__dirname, '../deployments');
  const networkDir = path.join(deploymentsDir, network.name);
  
  if (!fs.existsSync(networkDir)) {
    throw new Error(`No deployments found for network ${network.name}`);
  }
  
  const latestDeploymentPath = path.join(networkDir, 'latest.json');
  
  if (!fs.existsSync(latestDeploymentPath)) {
    throw new Error(`No latest deployment found for network ${network.name}`);
  }
  
  const deployment = JSON.parse(fs.readFileSync(latestDeploymentPath));
  
  return {
    masterFactory: deployment.masterFactory,
    broadcastFactory: deployment.broadcastFactory,
    publicFactory: deployment.publicFactory,
    privateFactory: deployment.privateFactory,
    subContracts: deployment.subContracts || []
  };
}

async function verifyAllSubContracts() {
  try {
    console.log(`\nVerifying all sub contracts on ${network.name}...`);
    
    // Get deployment data
    const deploymentData = await getDeployedFactories();
    
    if (deploymentData.subContracts && deploymentData.subContracts.length > 0) {
      console.log(`Found ${deploymentData.subContracts.length} sub contracts in deployment data`);
      
      for (const contract of deploymentData.subContracts) {
        console.log(`\nVerifying ${contract.type} at ${contract.address}`);
        
        if (contract.constructorArgs) {
          await verifyContract(contract.address, contract.constructorArgs);
        } else {
          console.log(`No constructor arguments found for ${contract.address}, skipping verification`);
        }
      }
    } else {
      console.log("No sub contracts found in deployment data, checking factories...");
      
      // Try to find and verify BroadcastContracts
      const broadcastFactory = await ethers.getContractAt("BroadcastFactory", deploymentData.broadcastFactory);
      const allBroadcastContracts = await broadcastFactory.getAllBroadcastContracts();
      
      console.log(`Found ${allBroadcastContracts.length} BroadcastContracts`);
      
      for (const contractAddr of allBroadcastContracts) {
        try {
          console.log(`\nProcessing BroadcastContract at ${contractAddr}`);
          
          const contract = await ethers.getContractAt("BroadcastContract", contractAddr);
          
          // Try to get owner and title
          const owner = await contract.owner();
          const title = await contract.title();
          
          // Verify the contract
          await verifyContract(contractAddr, [owner, title]);
          
          // Get all sub contracts
          const allSubContracts = await contract.getAllBroadcastSubContracts();
          console.log(`Found ${allSubContracts.length} BroadcastSubContracts`);
          
          for (const subContractAddr of allSubContracts) {
            try {
              console.log(`Processing BroadcastSubContract at ${subContractAddr}`);
              
              const subContract = await ethers.getContractAt("BroadcastSubContract", subContractAddr);
              
              // Get constructor args for verification
              const subOwner = await subContract.owner();
              const startDate = await subContract.startDate();
              const endDate = await subContract.endDate();
              
              // Verify the sub contract
              await verifyContract(subContractAddr, [contractAddr, subOwner, startDate, endDate]);
            } catch (error) {
              console.log(`Error processing sub contract at ${subContractAddr}:`, error.message);
            }
          }
        } catch (error) {
          console.log(`Error processing contract at ${contractAddr}:`, error.message);
        }
      }
      
      // Similar code for PublicContracts and PrivateContracts would follow
    }
  } catch (error) {
    console.error("Error verifying sub contracts:", error);
  }
}

async function main() {
  await verifyAllSubContracts();
  console.log("\nVerification process completed");
}

// Execute the script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error during verification:", error);
      process.exit(1);
    });
}

module.exports = {
  verifyContract,
  verifyAllSubContracts
};
