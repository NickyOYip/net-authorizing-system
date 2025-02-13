// MetaMask Wallet Data
class Wallet {
    constructor(walletAddress, walletBalance, networkId) {
        this.walletAddress = walletAddress; // Connected wallet address
        this.walletBalance = walletBalance; // ETH balance
        this.networkId = networkId; // Ethereum network ID
    }
}
export { Wallet };