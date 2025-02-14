class History {
    /**
     * @param {number} timestamp - The timestamp of the history event (in seconds).
     * @param {string} newState - The new state of the certificate.
     * @param {number} disableTime - The disable time of the certificate (in seconds).
     */
    constructor(timestamp, newState, disableTime) {
        this.timestamp = new Date(timestamp * 1000); // Convert to JavaScript Date object
        this.newState = newState;
        this.disableTime = new Date(disableTime * 1000); // Convert to JavaScript Date object
    }
}

export { History };
