import { ethers } from 'ethers';
import CertificateABI from '../abis/Certificate.json';
import UserABI from '../abis/User.json'; // Add this import

/**
 * @title CertificateService
 * @notice Provides functions to handle certificate creation and management
 */

/**
 * @notice Generates a random activation code for certificates
 * @returns {string} The generated activation code
 */
export function generateActivationCode() {
    return Math.random().toString().slice(2, 12);
}

/**
 * @notice Calculates SHA-256 hash of provided content
 * @param {string} content - The content to hash
 * @returns {Promise<string>} The calculated hash in hexadecimal format
 */
export async function calculateHash(content) {
    const msgBuffer = new TextEncoder().encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * @notice Ensures the correct network is configured according to EIP-3085
 * @param {object} provider - The ethers provider
 * @returns {Promise<void>}
 */
async function ensureCorrectNetwork(provider) {
    try {
        const network = await provider.getNetwork();
        console.log('Current network:', network);

        // Hardhat network configuration
        const targetNetwork = {
            chainId: "0x7A69", // 31337 in hex
            chainName: "Hardhat Local",
            nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18
            },
            rpcUrls: ["http://127.0.0.1:8545/"],
            blockExplorerUrls: []
        };

        if (network.chainId !== parseInt(targetNetwork.chainId, 16)) {
            try {
                // Try to switch to the network first
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: targetNetwork.chainId }]
                });
            } catch (switchError) {
                // If the network doesn't exist, add it
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [targetNetwork]
                    });
                } else {
                    throw switchError;
                }
            }
        }
    } catch (error) {
        console.error('Network configuration error:', error);
        throw new Error('Failed to configure network. Please ensure MetaMask is properly set up.');
    }
}

/**
 * @notice Deploys a new certificate contract
 * @param {object} provider - The ethers provider
 * @param {object} data - Certificate data containing activeCode, documentHash, jsonHash, disableTime, certificateName, and orgName
 * @returns {Promise<string>} The address of the deployed certificate contract
 */
export async function deployCertificate(provider, data) {
    try {
        console.log('Deploying certificate with data:', {
            activeCode: data.activeCode,
            documentHash: data.documentHash,
            jsonHash: data.jsonHash,
            disableTime: data.disableTime,
            certificateName: data.certificateName,
            orgName: data.orgName
        });

        const signer = await provider.getSigner();
        console.log('Got signer:', signer);

        const factory = new ethers.ContractFactory(
            CertificateABI.abi,
            CertificateABI.bytecode,
            signer
        );

        const certificate = await factory.deploy(
            data.activeCode,
            data.documentHash,
            data.jsonHash,
            parseInt(data.disableTime) * 24 * 60 * 60,
            data.certificateName,
            data.orgName
        );

        console.log('Contract deployment transaction sent');
        const deployedContract = await certificate.waitForDeployment();
        const address = await deployedContract.getAddress();
        console.log('Contract deployed at:', address);
        
        return address;
    } catch (error) {
        console.error('Deployment error:', error);
        throw error;
    }
}

/**
 * @notice Adds a certificate to the certified list in the user's contract
 * @param {object} provider - The ethers provider
 * @param {string} userContractAddress - The address of the user's contract
 * @param {string} certificateAddress - The address of the deployed certificate
 * @returns {Promise<void>}
 */
export async function addCertificateToUser(provider, userContractAddress, certificateAddress) {
    try {
        console.log('Adding certificate to certified list:', {
            userContract: userContractAddress,
            certificate: certificateAddress
        });

        if (!userContractAddress) {
            throw new Error('User contract address is undefined');
        }

        const signer = await provider.getSigner();
        const userContract = new ethers.Contract(userContractAddress, UserABI.abi, signer);

        // Only add to certifiedCertificates
        console.log('Adding to certifiedCertificates...');
        const tx = await userContract.addCertifiedCertificate(certificateAddress, {
            gasLimit: 300000
        });
        console.log('Transaction sent:', tx.hash);
        await tx.wait();
        console.log('Certificate successfully added to certified list');

    } catch (error) {
        if (error.message.includes('Not the contract owner')) {
            throw new Error('You are not authorized to add certificates to this contract');
        }
        console.error('Error adding certificate:', {
            error,
            message: error.message,
            contract: userContractAddress,
            certificate: certificateAddress
        });
        throw error;
    }
}
