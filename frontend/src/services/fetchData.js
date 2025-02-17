import { ethers } from 'ethers';
import UserABI from '../abis/User.json';
import CertificateABI from '../abis/Certificate.json';
import { UserProfile, Certificate } from '../store/models/dataModels.js';

// Convert on-chain certificate data to a Certificate model instance
async function toCertificateModel(provider, certAddress) {
  const certContract = new ethers.Contract(certAddress, CertificateABI.abi, provider);
  const result = await certContract.getCertificate();
  const [data, documentHash, jsonHash, state, deployTime, disableTime, certificateName, orgName, owner] = result;
  const stateMap = ['Inactive', 'Active', 'Disabled'];
  return new Certificate({
    owner,
    userAddress: '', // Not returned by getCertificate (placeholder)
    data,
    documentHash,
    jsonHash,
    certificateName,
    orgName,
    activeCode: '',   // Not returned by getCertificate (placeholder)
    activeTime: 0,    // Not returned by getCertificate (placeholder)
    disableTime: Number(disableTime),
    deployTime: Number(deployTime),
    state: stateMap[Number(state)] || 'Unknown',
    history: []       // Populate if your app stores certificate history
  });
}

// Fetch user profile data using User model methods and convert to a UserProfile instance
export async function fetchUserProfile(provider, userContractAddress, userAddress) {
  if (!userContractAddress) throw new Error("User contract address not provided");
  const userContract = new ethers.Contract(userContractAddress, UserABI.abi, provider);
  const certificateAddresses = await userContract.getCertificates();
  const certifiedAddresses = await userContract.getCertifiedCertificates();

  const certificatesList = await Promise.all(
    certificateAddresses.map(addr => toCertificateModel(provider, addr))
  );
  const certifiedCertificates = await Promise.all(
    certifiedAddresses.map(addr => toCertificateModel(provider, addr))
  );

  // Construct a UserProfile instance
  return new UserProfile({
    owner: userAddress,
    certificatesList,
    certifiedCertificates,
    history: [] // Populate if your app stores user history
  });
}

// Optional helper if you only need a single certificate
export async function fetchCertificateDetails(provider, certificateAddress) {
  return toCertificateModel(provider, certificateAddress);
}
