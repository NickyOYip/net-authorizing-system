/**
 * Utility functions for contract interactions
 */
const crypto = require('crypto');

/**
 * Generate a random hash (compatible replacement for ethers.utils.randomBytes)
 * @param {number} bytes - Number of bytes to generate (default: 32)
 * @returns {string} - Hex string with 0x prefix
 */
function generateRandomHash(bytes = 32) {
  return "0x" + crypto.randomBytes(bytes).toString('hex');
}

/**
 * Wait for a transaction to be confirmed
 * @param {Object} tx - Transaction object
 * @returns {Promise<Object>} - Transaction receipt
 */
async function waitForTx(tx) {
  console.log(`Transaction hash: ${tx.hash || tx.hash}`);
  console.log('Waiting for transaction confirmation...');
  const receipt = await tx.wait();
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  return receipt;
}

/**
 * Get address from contract object, handling different ethers.js versions
 * @param {Object} contract - Contract object
 * @returns {string} - Contract address
 */
async function getContractAddress(contract) {
  if (typeof contract.address === 'string') {
    return contract.address;
  } else if (contract.getAddress) {
    return await contract.getAddress();
  } else if (contract.target) {
    return contract.target;
  }
  throw new Error('Could not determine contract address');
}

module.exports = {
  generateRandomHash,
  waitForTx,
  getContractAddress
};
