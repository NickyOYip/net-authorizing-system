import { ethers } from "ethers";
import { Certificate } from "./model/certificateModel";

// Import your contract ABIs here
import FactoryABI from "../abis/Factory.json";
import UserABI from "../abis/User.json";
import CertificateABI from "../abis/Certificate.json";

class DataStore {
    constructor(provider) {
        this.provider = provider;
        this.certificatesList = []; // Certificates owned by user
        this.certifiedCertificates = [];
        this.factoryAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // Only one factory instance
        this.chainId = 42; //chain u use
        this.registerTime = null; // Registration time

        this.init();
    }

    async init() {
        // Clear memory before initializing
        this.certificatesList = [];
        this.certifiedCertificates = [];

        const factoryContract = new ethers.Contract(this.factoryAddress, FactoryABI, this.provider);
        const userAddress = await factoryContract.find(this.provider.getSigner().getAddress());
        const userContract = new ethers.Contract(userAddress, UserABI, this.provider);

        // Listen for UserRegistered event to get the registration time
        factoryContract.on("UserRegistered", (user, contractAddress, timestamp) => {
            if (user === this.provider.getSigner().getAddress()) {
                this.registerTime = new Date(timestamp * 1000); // Convert to JavaScript Date object
            }
        });

        const certificateAddresses = await userContract.getCertificates();
        for (const certAddress of certificateAddresses) {
            const certificate = new Certificate(certAddress, this.provider);
            await certificate.init();
            this.certificatesList.push(certificate);
        }

        const certifiedCertificateAddresses = await userContract.getCertifiedCertificates();
        for (const certAddress of certifiedCertificateAddresses) {
            const certificate = new Certificate(certAddress, this.provider);
            await certificate.init();
            this.certifiedCertificates.push(certificate);
        }
    }
}

export default new DataStore();