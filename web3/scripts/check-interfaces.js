const { ethers, network } = require("hardhat");
const fs = require('fs');
const path = require('path');

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

async function checkContractInterface(contractAddress, contractName) {
  console.log(`\nChecking ${contractName} interface at ${contractAddress}...`);
  try {
    // Get the contract instance
    const contract = await ethers.getContractAt(contractName, contractAddress);
    console.log("Contract instance created successfully");
    
    // Get the contract factory
    const contractFactory = await ethers.getContractFactory(contractName);
    
    // Get functions directly from the interface
    const functions = contractFactory.interface.fragments.filter(
      fragment => fragment.type === "function"
    );
    
    console.log(`\n${contractName} Functions:`);
    for (const func of functions) {
      const inputs = func.inputs.map(input => `${input.type} ${input.name || ''}`).join(", ");
      const outputs = func.outputs.map(output => `${output.type} ${output.name || ''}`).join(", ");
      console.log(`- ${func.name}(${inputs}) ${outputs ? `→ (${outputs})` : ''}`);
    }
    
    // Get events directly from the interface
    const events = contractFactory.interface.fragments.filter(
      fragment => fragment.type === "event"
    );
    
    console.log(`\n${contractName} Events:`);
    for (const event of events) {
      const params = event.inputs.map(input => 
        `${input.type} ${input.indexed ? 'indexed ' : ''}${input.name || ''}`
      ).join(", ");
      console.log(`- ${event.name}(${params})`);
    }
    
    return contract;
  } catch (error) {
    console.log(`Error checking contract interface: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log(`Checking contracts on ${network.name}...`);
  
  try {
    // Get the deployed factory addresses
    const factories = await getDeployedFactories();
    console.log(`Factories in deployment:`);
    console.log(`- MasterFactory: ${factories.masterFactory}`);
    console.log(`- BroadcastFactory: ${factories.broadcastFactory}`);
    console.log(`- PublicFactory: ${factories.publicFactory}`);
    console.log(`- PrivateFactory: ${factories.privateFactory}`);
    
    // Check all contract interfaces
    await checkContractInterface(factories.masterFactory, "MasterFactory");
    await checkContractInterface(factories.broadcastFactory, "BroadcastFactory");
    await checkContractInterface(factories.publicFactory, "PublicFactory");
    await checkContractInterface(factories.privateFactory, "PrivateFactory");
    
  } catch (error) {
    console.error("Error checking interfaces:", error);
  }
}

// Execute the script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  checkContractInterface,
  getDeployedFactories
};
