import { ethers } from 'ethers';
import CertificateABI from '../abi/Certificate.json';
import { History } from './historyModel';

// Certificate Contract Data
class Certificate {
    constructor(certificateAddress, provider) {
        this.certificateAddress = certificateAddress; // Certificate contract address
        this.provider = provider; // Ethers provider
        this.owner; // Owner of certificate
        this.userAddress; // User associated with certificate
        this.documentHash; // Certified document hash
        this.jsonHash; // VP(Data) hash
        this.data; // Decrypted JSON data
        this.state; // Enum: Inactive, Active, Disabled
        this.disableTime; // Expiration time
        this.deployTime; // Deploy time
        this.activeTime; // Active time
        this.certificateName; // Certified time
        this.orgName; // Certificate type
        this.history = []; // History of certificate updates

        this.init();
    }

    async init() {
        const contract = new ethers.Contract(this.certificateAddress, CertificateABI, this.provider);

        const certificateInfo = await contract.getCertificate();

        this.data = certificateInfo[0];
        this.documentHash = certificateInfo[1];
        this.jsonHash = certificateInfo[2];
        this.state = certificateInfo[3];
        this.deployTime = certificateInfo[4];
        this.disableTime = certificateInfo[5];
        this.certificateName = certificateInfo[6];
        this.orgName = certificateInfo[7];
        this.owner = certificateInfo[8]; // Add owner address

        // Fetch the active time from CertificateActivated event
        const filterActivated = contract.filters.CertificateActivated();
        const eventsActivated = await contract.queryFilter(filterActivated);
        if (eventsActivated.length > 0) {
            this.activeTime = new Date(eventsActivated[0].args.timestamp * 1000); // Convert to JavaScript Date object
        }

        // Fetch the history of the certificate by listening to StateUpdated events
        const filterStateUpdated = contract.filters.StateUpdated();
        const eventsStateUpdated = await contract.queryFilter(filterStateUpdated);
        for (const event of eventsStateUpdated) {
            this.history.push(new History(event.args.timestamp, event.args.newState, event.args.disableTime));
        }
    }
}

export { Certificate };