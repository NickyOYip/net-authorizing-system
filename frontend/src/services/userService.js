import { ethers } from 'ethers';
import FactoryABI from '../abis/Factory.json';
import UserABI from '../abis/User.json';

/**
 * @title UserService
 * @notice Provides functions to interact with the User and Factory contracts
 */

/**
 * @notice Registers a new user by associating their address with a contract address
 * @param {object} provider - The ethers provider
 * @param {string} factoryAddress - The address of the Factory contract
 * @param {string} userAddress - The address of the user to register
 * @param {string} contractAddress - The contract address to associate with the user
 * @returns {Promise<void>}
 */
export const registerUser = async (provider, factoryAddress, userAddress, contractAddress) => {
  try {
    console.log(`Registering user ${userAddress} with contract ${contractAddress}`);
    const signer = await provider.getSigner();
    const factoryContract = new ethers.Contract(factoryAddress, FactoryABI, signer);
    
    const tx = await factoryContract.add(userAddress, contractAddress);
    await tx.wait();
    console.log(`User ${userAddress} registered successfully`);
  } catch (error) {
    console.error('Error registering user', error);
    throw error;
  }
};

/**
 * @notice Retrieves the contract address associated with a specific user
 * @param {object} provider - The ethers provider
 * @param {string} factoryAddress - The address of the Factory contract
 * @param {string} userAddress - The address of the user whose contract address is being queried
 * @returns {Promise<string>}
 */
export const findUserContract = async (provider, factoryAddress, userAddress) => {
  // For view calls, use provider instead of provider.getSigner()
  const factoryContract = new ethers.Contract(factoryAddress, FactoryABI, provider);
  try {
    console.log(`Finding contract for user ${userAddress}`);
    const contractAddress = await factoryContract.find(userAddress);
    console.log(`Found contract ${contractAddress} for user ${userAddress}`);
    return contractAddress;
  } catch (error) {
    console.error('[not error]Error finding user contract', error);
    throw error;
  }
};

/**
 * @notice Deploys a new user contract
 * @param {object} provider - The ethers provider
 * @param {string} userAddress - The address of the user for whom the contract is being deployed
 * @returns {Promise<string>} - The address of the newly deployed user contract
 */
export const deployUserContract = async (provider, userAddress) => {
  try {
    console.log(`Deploying new user contract for ${userAddress}`);
    const signer = await provider.getSigner();
    
    // Create contract factory with bytecode and ABI from the JSON file
    const factory = new ethers.ContractFactory(
      UserABI.abi,
      UserABI.bytecode,
      signer
    );
    
    // Deploy the contract
    console.log('Deploying contract...');
    const userContract = await factory.deploy();
    console.log('Waiting for deployment...');
    await userContract.waitForDeployment();
    
    const contractAddress = await userContract.getAddress();
    console.log(`Deployed new user contract at ${contractAddress} for ${userAddress}`);
    return contractAddress;
  } catch (error) {
    console.error('Error deploying user contract:', error);
    throw error;
  }
};

/**
 * @notice Finds or deploys a user contract
 * @param {object} provider - The ethers provider
 * @param {string} factoryAddress - The address of the Factory contract
 * @param {string} userAddress - The address of the user
 * @returns {Promise<string>} - The address of the user contract
 */
export const findOrDeployUserContract = async (provider, factoryAddress, userAddress) => {
  try {
    // Try to find existing contract
    const contractAddress = await findUserContract(provider, factoryAddress, userAddress);
    console.log('Found existing contract:', contractAddress);
    return contractAddress;
  } catch (error) {
    // Check if the error contains "No such user" in either error.reason or the error message
    if (error.reason?.includes("No such user") || error.message?.includes("No such user")) {
      console.log("No existing contract found, deploying new one...");
      try {
        const newContractAddress = await deployUserContract(provider, userAddress);
        console.log('New contract deployed:', newContractAddress);
        
        await registerUser(provider, factoryAddress, userAddress, newContractAddress);
        console.log('User registered with new contract');
        
        // Verify the registration
        const verifiedAddress = await findUserContract(provider, factoryAddress, userAddress);
        console.log('Verified contract address:', verifiedAddress);
        
        return verifiedAddress;
      } catch (deployError) {
        console.error('Error during contract deployment or registration:', deployError);
        throw deployError;
      }
    }
    // If it's a different error, throw it
    console.error('Unexpected error:', error);
    throw error;
  }
};
