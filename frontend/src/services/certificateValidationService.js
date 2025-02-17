import { ethers } from 'ethers';
import CertificateABI from '../abis/Certificate.json';
import { calculateHash } from './certificateService';

/**
 * @notice Validates certificate data against on-chain data
 * @param {object} provider - The ethers provider
 * @param {string} certificateAddress - The address of the certificate contract
 * @param {object} certificateData - The certificate data to validate
 * @param {File} documentFile - The document file to validate
 * @returns {Promise<object>} Validation results and certificate details
 */
export async function validateCertificate(provider, certificateAddress, certificateData, documentFile) {
    try {
        // Create contract instance
        const certificateContract = new ethers.Contract(
            certificateAddress,
            CertificateABI.abi,
            provider
        );

        // Get on-chain certificate data
        const [
            data,
            documentHash,
            jsonHash,
            state,
            deployTime,
            disableTime,
            certificateName,
            orgName,
            owner
        ] = await certificateContract.getCertificate();

        // Calculate hash from provided data (handle both JSON and string)
        let dataToHash = typeof certificateData === 'object' ? JSON.stringify(certificateData) : certificateData;
        const calculatedJsonHash = await calculateHash(dataToHash);
        
        // Calculate document hash
        const documentBuffer = await documentFile.arrayBuffer();
        const calculatedDocumentHash = await calculateHash(documentBuffer);

        // Debug logs to verify document hash values
        console.log("On-chain documentHash:", documentHash);
        console.log("Calculated documentHash:", calculatedDocumentHash);

        // Validate hashes (remove '0x' prefix if present for comparison)
        const isJsonValid = jsonHash.toLowerCase() === calculatedJsonHash.toLowerCase();
        const isDocumentValid = documentHash.toLowerCase() === calculatedDocumentHash.toLowerCase();

        // Convert state number to string
        const stateMap = ['Inactive', 'Active', 'Disabled'];
        const stateString = stateMap[Number(state)];

        // Convert BigInt timestamps to numbers and format dates
        const deployDate = new Date(Number(deployTime) * 1000).toLocaleString();
        const disableDate = new Date(Number(disableTime) * 1000).toLocaleString();

        return {
            isValid: isJsonValid && isDocumentValid,
            details: {
                certificateName,
                orgName,
                owner,
                state: stateString,
                deployTime: deployDate,
                disableTime: disableDate
            },
            verification: {
                jsonHashMatch: isJsonValid,
                documentHashMatch: isDocumentValid
            }
        };
    } catch (error) {
        console.error('Error validating certificate:', error);
        throw new Error('Failed to validate certificate: ' + error.message);
    }
}
