const fs = require('fs');
const path = require('path');

/**
 * Save deployment addresses to a JSON file
 * @param {Object} deployedContracts - Object containing deployed contract addresses
 * @param {string} networkName - The name of the network where contracts are deployed
 */
function saveDeployment(deployedContracts, networkName) {
  const deploymentsDir = path.join(__dirname, '../deployments');
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  // Create network-specific directory if it doesn't exist
  const networkDir = path.join(deploymentsDir, networkName);
  if (!fs.existsSync(networkDir)) {
    fs.mkdirSync(networkDir);
  }
  
  // Create latest.json file with deployment info
  const deployment = {
    masterFactory: deployedContracts.masterFactory,
    broadcastFactory: deployedContracts.broadcastFactory,
    publicFactory: deployedContracts.publicFactory,
    privateFactory: deployedContracts.privateFactory,
    deployedBy: deployedContracts.deployedBy,
    deployedAt: new Date().toISOString(),
    // Add sub contracts tracking
    subContracts: deployedContracts.subContracts || []
  };
  
  // Also create a timestamped copy for history
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  
  // Write the files
  fs.writeFileSync(
    path.join(networkDir, 'latest.json'),
    JSON.stringify(deployment, null, 2)
  );
  
  fs.writeFileSync(
    path.join(networkDir, `deployment-${timestamp}.json`),
    JSON.stringify(deployment, null, 2)
  );
  
  console.log(`Deployment info saved to ${path.join(networkDir, 'latest.json')}`);
}

/**
 * Save sub contract information for verification
 * @param {Object} subContract - Object containing sub contract info
 * @param {string} networkName - The name of the network where contracts are deployed 
 */
function saveSubContract(subContract, networkName) {
  const deploymentsDir = path.join(__dirname, '../deployments');
  const networkDir = path.join(deploymentsDir, networkName);
  
  if (!fs.existsSync(networkDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
    fs.mkdirSync(networkDir);
  }
  
  // Load existing deployment
  let deployment;
  const latestPath = path.join(networkDir, 'latest.json');
  
  if (fs.existsSync(latestPath)) {
    deployment = JSON.parse(fs.readFileSync(latestPath));
  } else {
    deployment = {
      subContracts: []
    };
  }
  
  // Add new sub contract
  if (!deployment.subContracts) {
    deployment.subContracts = [];
  }
  
  deployment.subContracts.push(subContract);
  
  // Save updated deployment
  fs.writeFileSync(latestPath, JSON.stringify(deployment, null, 2));
  
  console.log(`Sub contract ${subContract.address} saved to deployment info`);
}

module.exports = {
  saveDeployment,
  saveSubContract
};
