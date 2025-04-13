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
  const deploymentDir = path.join(__dirname, '../deployments');
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  // Save to network-specific file
  const networkFile = path.join(deploymentDir, `${networkName}.json`);
  fs.writeFileSync(networkFile, JSON.stringify(addresses, null, 2));
  console.log(`Deployment addresses saved to: ${networkFile}`);
  
  // Save to timestamped backup file
  const backupFile = path.join(deploymentDir, `${networkName}-${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(addresses, null, 2));
  console.log(`Backup saved to: ${backupFile}`);
  
  // Save to root deployment file for verification script
  const rootFile = path.join(__dirname, '../deployment-addresses.json');
  fs.writeFileSync(rootFile, JSON.stringify(addresses, null, 2));
  console.log(`Deployment addresses saved to: ${rootFile}`);
}

module.exports = {
  saveDeployment
};
