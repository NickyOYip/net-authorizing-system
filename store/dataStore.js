import { ethers } from "ethers";
import { Certificate } from "./model/certificateModel";

// Import your contract ABIs here
import FactoryABI from "../abis/Factory.json";
import UserABI from "../abis/User.json";
import CertificateABI from "../abis/Certificate.json";

class DataStore {
    static instance = null; // Store Singleton instance

    constructor(provider) {
        if (DataStore.instance) {
            return DataStore.instance; // Return existing instance
        }

        this.provider = provider;
        this.certificatesList = []; // Certificates owned by user
        this.certifiedCertificates = [];
        this.factoryAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // Only one factory instance
        this.chainId = 42; // Chain ID
        this.registerTime = null; // Registration time
        this.userAddress = null; // UserContract address

        DataStore.instance = this; // Save instance
    }

    async init() {
        if (!this.provider) {
            console.error("❌ Provider not set. Cannot initialize.");
            return;
        }

        try {
            console.log("⏳ Initializing DataStore...");
            this.certificatesList = [];
            this.certifiedCertificates = [];

            const signer = await this.provider.getSigner();
            const factoryContract = new ethers.Contract(this.factoryAddress, FactoryABI, this.provider);
            const userAddress = await factoryContract.find(signer.getAddress());
            this.userAddress = userAddress;
            const userContract = new ethers.Contract(userAddress, UserABI, this.provider);

            // Listen for UserRegistered event
            factoryContract.on("UserRegistered", (user, contractAddress, timestamp) => {
                if (user === signer.getAddress()) {
                    this.registerTime = new Date(timestamp * 1000);
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

            console.log("✅ DataStore initialized successfully.");
        } catch (error) {
            console.error("❌ DataStore initialization failed:", error);
        }
    }
}

// Export a Singleton instance
const dataStore = new DataStore();
export default dataStore;
