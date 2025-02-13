// Certificate Contract Data
class Certificate {
    constructor(owner, userAddress, documentHash, jsonHash, data, state, disableTime) {
        this.owner = owner; // Owner of certificate
        this.userAddress = userAddress; // User associated with certificate
        this.documentHash = documentHash; // Certified document hash
        this.jsonHash = jsonHash; // VP(Data) hash
        this.data = data; // Decrypted JSON data
        this.state = state; // Enum: Inactive, Active, Disabled
        this.disableTime = disableTime; // Expiration time
    }
}
export { Certificate };