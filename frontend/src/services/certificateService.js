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
 * @notice Calculates SHA-256 hash for a string or ArrayBuffer.
 * @param {string|ArrayBuffer} content - The content to hash.
 * @returns {Promise<string>} The SHA-256 hash as a hex string with a '0x' prefix.
 */
export async function calculateHash(content) {
  const data = typeof content === 'string'
    ? new TextEncoder().encode(content)
    : content instanceof ArrayBuffer
      ? content
      : (() => { throw new Error('Unsupported content type for hashing'); })();
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * @notice Ensures the correct network is configured according to EIP-3085
 * @param {object} provider - The ethers provider
 * @returns {Promise<void>}
 */

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
 * @param {function} refetchCallback - Optional callback to refetch user profile
 * @returns {Promise<void>}
 */
export async function addCertificateToUser(provider, userContractAddress, certificateAddress, refetchCallback) {
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
        
        // Refetch user profile after successful transaction
        if (refetchCallback) await refetchCallback();

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

/**
 * @notice Activates a certificate using the provided code and adds it to the user's list
 * @param {string} certificateAddress - The address of the certificate to activate
 * @param {string} userContractAddress - The address of the user's contract
 * @param {string} activationCode - The activation code
 * @param {string} userAddress - The address of the user activating the certificate
 * @param {object} signer - The ethers signer
 * @param {function} refetchCallback - Optional callback to refetch user profile
 * @returns {Promise<boolean>} True if the activation and addition were successful
 */
export async function activateCertificate(certificateAddress, userContractAddress, activationCode, userAddress, signer, refetchCallback) {
    try {
        console.log('Starting certificate activation process:', {
            certificateAddress,
            userContractAddress,
            activationCode,
            userAddress
        });

        // Step 1: Activate the certificate
        const certificateContract = new ethers.Contract(certificateAddress, CertificateABI.abi, signer);
        console.log('Calling certificate activation...');
        const tx1 = await certificateContract.activateCertificate(userAddress, activationCode, JSON.stringify({ timestamp: Date.now() }));
        console.log('Certificate activation tx sent:', tx1.hash);
        await tx1.wait();
        console.log('Certificate activation confirmed');

        // Step 2: Add certificate to user's list
        const userContract = new ethers.Contract(userContractAddress, UserABI.abi, signer);
        console.log('Adding certificate to user contract...');
        const tx2 = await userContract.addCertificate(certificateAddress);
        console.log('Add to user contract tx sent:', tx2.hash);
        await tx2.wait();
        console.log('Certificate added to user contract');

        // Refetch user profile after successful activation
        if (refetchCallback) await refetchCallback();
        return true;
    } catch (error) {
        console.error('Error in activation process:', error);
        throw error;
    }
}
