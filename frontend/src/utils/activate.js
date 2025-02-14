import { ethers } from "ethers";
import DataStore from "../store/dataStore";
import CertificateABI from "../abis/Certificate.json";
import UserABI from "../abis/User.json";

async function activateCertificate(certificateAddress, activationCode, data) {
    try {
        const provider = DataStore.provider;
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        const certificateContract = new ethers.Contract(certificateAddress, CertificateABI, signer);

        // Call the activateCertificate function on the contract
        const tx = await certificateContract.activateCertificate(userAddress, activationCode, data);
        await tx.wait();

        // Listen for the CertificateActivated event to confirm activation
        certificateContract.on("CertificateActivated", async (user, timestamp) => {
            if (user === userAddress) {
                console.log(`Certificate activated at ${new Date(timestamp * 1000).toLocaleString()}`);

                // Call addCertificate in the User contract
                const userContractAddress = await DataStore.getUserContractAddress(userAddress);
                const userContract = new ethers.Contract(userContractAddress, UserABI, signer);
                await userContract.addCertificate(certificateAddress);
            }
        });
    } catch (error) {
        console.error("Error activating certificate:", error);
    }
}

export default activateCertificate;
