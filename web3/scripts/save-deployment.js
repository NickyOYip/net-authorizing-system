const fs = require('fs');
const path = require('path');

/**
 * Save deployment addresses to a JSON file
 * @param {Object} addresses - Object containing all deployed contract addresses
 * @param {string} networkName - Name of the network where contracts were deployed
 */
function saveDeployment(addresses, networkName = 'unknown') {
  // Create a timestamped filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Create network-specific directory structure
  const networkDir = path.join(__dirname, '../deployments', networkName);
  if (!fs.existsSync(networkDir)) {
    fs.mkdirSync(networkDir, { recursive: true });
  }
  
  // Save deployment to timestamped file in the network directory
  const deploymentFile = path.join(networkDir, `${timestamp}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(addresses, null, 2));
  console.log(`Deployment addresses saved to: ${deploymentFile}`);
  
  // Also save a copy to the latest.json file for easy access
  const latestFile = path.join(networkDir, 'latest.json');
  fs.writeFileSync(latestFile, JSON.stringify(addresses, null, 2));
  console.log(`Latest deployment updated at: ${latestFile}`);
}

module.exports = {
  saveDeployment
};
