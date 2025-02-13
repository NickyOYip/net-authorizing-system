import { ethers } from "ethers";
import { User } from "./model/userModel";
import { Certificate } from "./model/certificateModel";
import { Factory } from "./model/factoryModel";
import { Wallet } from "./model/walletModel";

// Import your contract ABIs here
import FactoryABI from "../abis/Factory.json";
import UserABI from "../abis/User.json";
import CertificateABI from "../abis/Certificate.json";

class DataStore {
    constructor() {
        this.user = null; // Only one user instance
        this.factory = null; // Only one factory instance
        this.certificates = []; // Multiple certificates allowed
        this.wallets = []; // Multiple wallets allowed
    }

    // User methods
    setUser(user) {
        if (user instanceof User) {
            this.user = user;
        } else {
            console.error("Invalid user object");
        }
    }

    getUser() {
        return this.user;
    }

    // Factory methods
    setFactory(factory) {
        if (factory instanceof Factory) {
            this.factory = factory;
        } else {
            console.error("Invalid factory object");
        }
    }

    getFactory() {
        return this.factory;
    }

    // Certificate methods
    addCertificate(certificate) {
        if (certificate instanceof Certificate) {
            this.certificates.push(certificate);
        } else {
            console.error("Invalid certificate object");
        }
    }

    getCertificates() {
        return this.certificates;
    }

    // Wallet methods
    addWallet(wallet) {
        if (wallet instanceof Wallet) {
            this.wallets.push(wallet);
        } else {
            console.error("Invalid wallet object");
        }
    }

    getWallets() {
        return this.wallets;
    }

    /**
     * loadChainData: Load blockchain data into the data store using ethers.js.
     * @param {ethers.providers.Web3Provider} provider - An ethers provider instance.
     * @param {String} factoryAddress - Deployed Factory contract address.
     */
    async loadChainData(provider, factoryAddress) {
        try {
            // Get accounts from the provider
            const accounts = await provider.listAccounts();
            if (!accounts || accounts.length === 0) {
                console.error("No accounts available.");
                return;
            }
            const signer = provider.getSigner();
            const network = await provider.getNetwork();

            // Load user wallet info from the first account.
            const balanceBigNumber = await provider.getBalance(accounts[0]);
            const balance = ethers.utils.formatEther(balanceBigNumber);
            const wallet = new Wallet(accounts[0], balance, network.chainId);
            this.addWallet(wallet);

            // Load Factory contract using the signer.
            const factoryContract = new ethers.Contract(factoryAddress, FactoryABI, signer);
            // For demonstration, we simply wrap the factory address in our model.
            const factoryInstance = new Factory(factoryAddress);
            this.setFactory(factoryInstance);

            // Optionally, if the Factory contract holds user-related info,
            // you can fetch the user's associated contract address.
            const userContractAddress = await factoryContract.find(accounts[0]);
            // If a valid user contract address exists, create a User instance.
            if (userContractAddress && userContractAddress !== ethers.constants.AddressZero) {
                // For a real use-case, you might interact further with the User contract.
                const userContract = new ethers.Contract(userContractAddress, UserABI, signer);
                const userInstance = new User();
                this.setUser(userInstance);
            }

            // Similarly, if you need to load Certificate data,
            // you could add logic to load each certificate.
            console.log("Chain data loaded successfully with ethers.js.");
        } catch (error) {
            console.error("Error loading chain data:", error);
        }
    }
}

export default new DataStore();