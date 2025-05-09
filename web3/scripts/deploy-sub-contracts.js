const { ethers, network, run } = require("hardhat");
const fs = require('fs');
const path = require('path');
const { saveSubContract } = require('./save-deployment');

// Add a delay function to wait before verification
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
    privateFactory: deployment.privateFactory
  };
}

async function deployBroadcastContract(broadcastFactoryAddress, title) {
  console.log(`\nDeploying BroadcastContract with title: ${title}`);
  
  try {
    const broadcastFactory = await ethers.getContractAt("BroadcastFactory", broadcastFactoryAddress);

    // Corrected function signature based on interface check: createBroadcastContract(string title)
    const tx = await broadcastFactory.createBroadcastContract(title);
    console.log("Transaction submitted for BroadcastContract deployment");
    
    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.hash);
    
    // Fix for receipt.events not being iterable
    let contractAddr = null;
    
    // Different ways to access events depending on ethers.js version
    if (receipt.events) {
      if (Array.isArray(receipt.events)) {
        // For ethers v5 and some v6 configurations
        for (const event of receipt.events) {
          try {
            if (event.event === "NewBroadcastContractOwned" && event.args) {
              contractAddr = event.args.contractAddr;
              break;
            }
          } catch (e) {
            // Skip if event parsing fails
          }
        }
      } else if (typeof receipt.events === 'object') {
        // For some ethers v6 configurations
        Object.values(receipt.events).forEach(event => {
          try {
            if (event.name === "NewBroadcastContractOwned" && event.args) {
              contractAddr = event.args.contractAddr;
            }
          } catch (e) {
            // Skip if event parsing fails
          }
        });
      }
    }
    
    // If we couldn't find the event, try raw logs
    if (!contractAddr && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          // Try to decode the log as a NewBroadcastContractOwned event
          const iface = new ethers.utils.Interface([
            "event NewBroadcastContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr, string title)"
          ]);
          const decodedLog = iface.parseLog(log);
          if (decodedLog.name === "NewBroadcastContractOwned") {
            contractAddr = decodedLog.args.contractAddr;
            break;
          }
        } catch (e) {
          // Skip if log parsing fails
        }
      }
    }

    // If we still couldn't find it, try to get all contracts from the factory
    if (!contractAddr) {
      console.log("Could not find contract address from events, trying getAllBroadcastContracts...");
      const allContracts = await broadcastFactory.getAllBroadcastContracts();
      if (allContracts && allContracts.length > 0) {
        contractAddr = allContracts[allContracts.length - 1];
      }
      
      if (!contractAddr) {
        throw new Error("Could not determine deployed contract address");
      }
    }
    
    console.log(`BroadcastContract deployed at ${contractAddr}`);
    
    // Get deployer address
    const [deployer] = await ethers.getSigners();
    
    // Save contract info
    const contract = {
      type: "BroadcastContract",
      address: contractAddr,
      factory: broadcastFactoryAddress,
      owner: deployer.address,
      title: title,
      constructorArgs: [deployer.address, title],
      deployedAt: new Date().toISOString()
    };
    
    await saveSubContract(contract, network.name);
    
    // Verify the contract
    await verifyContract(contractAddr, [deployer.address, title]);
    
    return contractAddr;
  } catch (error) {
    console.error("Error deploying BroadcastContract:", error);
    throw error;
  }
}

async function deployPublicContract(publicFactoryAddress, title) {
  console.log(`\nDeploying PublicContract with title: ${title}`);
  
  try {
    const publicFactory = await ethers.getContractAt("PublicFactory", publicFactoryAddress);
    
    // Create activation code - for demo purposes using a simple string
    const activationCode = "123456";
    
    // Corrected function signature based on interface check: createPublicContract(string title, string activationCode)
    const tx = await publicFactory.createPublicContract(title, activationCode);
    console.log("Transaction submitted for PublicContract deployment");
    
    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.hash);
    
    // Fix for receipt.events not being iterable - same pattern as deployBroadcastContract
    let contractAddr = null;
    
    // Different ways to access events depending on ethers.js version
    if (receipt.events) {
      if (Array.isArray(receipt.events)) {
        for (const event of receipt.events) {
          try {
            if (event.event === "NewPublicContractOwned" && event.args) {
              contractAddr = event.args.contractAddr;
              break;
            }
          } catch (e) {
            // Skip if event parsing fails
          }
        }
      } else if (typeof receipt.events === 'object') {
        Object.values(receipt.events).forEach(event => {
          try {
            if (event.name === "NewPublicContractOwned" && event.args) {
              contractAddr = event.args.contractAddr;
            }
          } catch (e) {
            // Skip if event parsing fails
          }
        });
      }
    }
    
    // If we couldn't find the event, try raw logs
    if (!contractAddr && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const iface = new ethers.utils.Interface([
            "event NewPublicContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr, string title)"
          ]);
          const decodedLog = iface.parseLog(log);
          if (decodedLog.name === "NewPublicContractOwned") {
            contractAddr = decodedLog.args.contractAddr;
            break;
          }
        } catch (e) {
          // Skip if log parsing fails
        }
      }
    }

    // If we still couldn't find it, try to get all contracts from the factory
    if (!contractAddr) {
      console.log("Could not find contract address from events, trying getAllPublicContracts...");
      const allContracts = await publicFactory.getAllPublicContracts();
      if (allContracts && allContracts.length > 0) {
        contractAddr = allContracts[allContracts.length - 1];
      }
      
      if (!contractAddr) {
        throw new Error("Could not determine deployed contract address");
      }
    }
    
    console.log(`PublicContract deployed at ${contractAddr}`);
    
    // Get deployer address
    const [deployer] = await ethers.getSigners();
    
    // Save contract info
    const contract = {
      type: "PublicContract",
      address: contractAddr,
      factory: publicFactoryAddress,
      owner: deployer.address,
      title: title,
      activationCode: activationCode, // Save this for demo purposes
      constructorArgs: [deployer.address, title],
      deployedAt: new Date().toISOString()
    };
    
    await saveSubContract(contract, network.name);
    
    // Verify the contract
    await verifyContract(contractAddr, [deployer.address, title]);
    
    return contractAddr;
  } catch (error) {
    console.error("Error deploying PublicContract:", error);
    throw error;
  }
}

async function deployPrivateContract(privateFactoryAddress, title) {
  console.log(`\nDeploying PrivateContract with title: ${title}`);
  
  try {
    const privateFactory = await ethers.getContractAt("PrivateFactory", privateFactoryAddress);
    
    // Create activation code - for demo purposes using a simple string
    const activationCode = "123456";
    
    // Corrected function signature based on interface check: createPrivateContract(string title, string activationCode)
    const tx = await privateFactory.createPrivateContract(title, activationCode);
    console.log("Transaction submitted for PrivateContract deployment");
    
    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.hash);
    
    // Fix for receipt.events not being iterable - same pattern as deployBroadcastContract
    let contractAddr = null;
    
    // Different ways to access events depending on ethers.js version
    if (receipt.events) {
      if (Array.isArray(receipt.events)) {
        for (const event of receipt.events) {
          try {
            if (event.event === "NewPrivateContractOwned" && event.args) {
              contractAddr = event.args.contractAddr;
              break;
            }
          } catch (e) {
            // Skip if event parsing fails
          }
        }
      } else if (typeof receipt.events === 'object') {
        Object.values(receipt.events).forEach(event => {
          try {
            if (event.name === "NewPrivateContractOwned" && event.args) {
              contractAddr = event.args.contractAddr;
            }
          } catch (e) {
            // Skip if event parsing fails
          }
        });
      }
    }
    
    // If we couldn't find the event, try raw logs
    if (!contractAddr && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const iface = new ethers.utils.Interface([
            "event NewPrivateContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr, string title)"
          ]);
          const decodedLog = iface.parseLog(log);
          if (decodedLog.name === "NewPrivateContractOwned") {
            contractAddr = decodedLog.args.contractAddr;
            break;
          }
        } catch (e) {
          // Skip if log parsing fails
        }
      }
    }

    // If we still couldn't find it, try to get all contracts from the factory
    if (!contractAddr) {
      console.log("Could not find contract address from events, trying getAllPrivateContracts...");
      const allContracts = await privateFactory.getAllPrivateContracts();
      if (allContracts && allContracts.length > 0) {
        contractAddr = allContracts[allContracts.length - 1];
      }
      
      if (!contractAddr) {
        throw new Error("Could not determine deployed contract address");
      }
    }
    
    console.log(`PrivateContract deployed at ${contractAddr}`);
    
    // Get deployer address
    const [deployer] = await ethers.getSigners();
    
    // Save contract info
    const contract = {
      type: "PrivateContract",
      address: contractAddr,
      factory: privateFactoryAddress,
      owner: deployer.address,
      title: title,
      activationCode: activationCode, // Save this for demo purposes
      constructorArgs: [deployer.address, title],
      deployedAt: new Date().toISOString()
    };
    
    await saveSubContract(contract, network.name);
    
    // Verify the contract
    await verifyContract(contractAddr, [deployer.address, title]);
    
    return contractAddr;
  } catch (error) {
    console.error("Error deploying PrivateContract:", error);
    throw error;
  }
}

async function deployBroadcastSubContract(broadcastContractAddr, startDate, endDate, jsonLink, jsonHash, softCopyLink, softCopyHash) {
  console.log(`\nDeploying BroadcastSubContract for contract at ${broadcastContractAddr}`);
  
  try {
    const broadcastContract = await ethers.getContractAt("BroadcastContract", broadcastContractAddr);
    
    // Convert dates if they are Date objects
    if (startDate instanceof Date) {
      startDate = Math.floor(startDate.getTime() / 1000);
    }
    
    if (endDate instanceof Date) {
      endDate = Math.floor(endDate.getTime() / 1000);
    }
    
    // Call addNewBroadcastSubContract with the correct parameter order
    const tx = await broadcastContract.addNewBroadcastSubContract(
      jsonLink,
      jsonHash,
      softCopyLink,
      softCopyHash,
      startDate,
      endDate
    );
    console.log("Transaction submitted for BroadcastSubContract deployment");
    
    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.hash);
    
    // Fix for receipt.events not being iterable - same pattern as deployBroadcastContract
    let subContractAddr = null;
    
    // Different ways to access events depending on ethers.js version
    if (receipt.events) {
      if (Array.isArray(receipt.events)) {
        for (const event of receipt.events) {
          try {
            if (event.event === "NewBroadcastSubContractOwned" && event.args) {
              subContractAddr = event.args.subContractAddr;
              break;
            }
          } catch (e) {
            // Skip if event parsing fails
          }
        }
      } else if (typeof receipt.events === 'object') {
        Object.values(receipt.events).forEach(event => {
          try {
            if (event.name === "NewBroadcastSubContractOwned" && event.args) {
              subContractAddr = event.args.subContractAddr;
            }
          } catch (e) {
            // Skip if event parsing fails
          }
        });
      }
    }
    
    // If we couldn't find the event, try raw logs
    if (!subContractAddr && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const iface = new ethers.utils.Interface([
            "event NewBroadcastSubContractOwned(address indexed parentAddr, address indexed subContractAddr, address indexed ownerAddr)"
          ]);
          const decodedLog = iface.parseLog(log);
          if (decodedLog.name === "NewBroadcastSubContractOwned") {
            subContractAddr = decodedLog.args.subContractAddr;
            break;
          }
        } catch (e) {
          // Skip if log parsing fails
        }
      }
    }

    // If we still couldn't find it, try to get all sub contracts from the parent contract
    if (!subContractAddr) {
      console.log("Could not find sub contract address from events, trying getAllBroadcastSubContracts...");
      const allSubContracts = await broadcastContract.getAllBroadcastSubContracts();
      if (allSubContracts && allSubContracts.length > 0) {
        subContractAddr = allSubContracts[allSubContracts.length - 1];
      }
      
      if (!subContractAddr) {
        throw new Error("Could not determine deployed sub contract address");
      }
    }
    
    console.log(`BroadcastSubContract deployed at ${subContractAddr}`);
    
    // Get the owner address
    const [deployer] = await ethers.getSigners();
    
    // Save contract info
    const subContract = {
      type: "BroadcastSubContract",
      address: subContractAddr,
      parent: broadcastContractAddr,
      owner: deployer.address,
      constructorArgs: [broadcastContractAddr, deployer.address, startDate, endDate],
      deployedAt: new Date().toISOString()
    };
    
    await saveSubContract(subContract, network.name);
    
    // Verify the sub contract
    await verifyContract(subContractAddr, subContract.constructorArgs);
    
    return subContractAddr;
  } catch (error) {
    console.error("Error deploying BroadcastSubContract:", error);
    throw error;
  }
}

async function main() {
  console.log(`Deploying contracts to ${network.name}...`);
  
  try {
    // Get the deployed factory addresses
    const factories = await getDeployedFactories();
    console.log(`Using factories from deployment:`);
    console.log(`MasterFactory: ${factories.masterFactory}`);
    console.log(`BroadcastFactory: ${factories.broadcastFactory}`);
    console.log(`PublicFactory: ${factories.publicFactory}`);
    console.log(`PrivateFactory: ${factories.privateFactory}`);
    
    // Deploy a sample BroadcastContract
    const broadcastContractTitle = "Sample Broadcast Contract";
    const broadcastContractAddr = await deployBroadcastContract(factories.broadcastFactory, broadcastContractTitle);
    
    // Deploy a sample BroadcastSubContract
    const now = Math.floor(Date.now() / 1000); // current time in seconds
    const oneYearLater = now + 365 * 24 * 60 * 60; // one year later in seconds
    
    await deployBroadcastSubContract(
      broadcastContractAddr,
      now,
      oneYearLater,
      "ipfs://QmSampleJson",
      "0xSampleJsonHash",
      "ipfs://QmSampleSoftCopy",
      "0xSampleSoftCopyHash"
    );
    
    console.log("\nSample contracts deployed successfully!");
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

// Execute the deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  deployBroadcastContract,
  deployPublicContract,
  deployPrivateContract,
  deployBroadcastSubContract
};
