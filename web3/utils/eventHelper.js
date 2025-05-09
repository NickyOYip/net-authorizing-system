/**
 * Helper functions to work with events in ethers.js
 */

/**
 * Process an event from a transaction receipt
 * @param {Object} receipt - Transaction receipt from ethers.js
 * @param {string} eventName - Name of event to find
 * @returns {Object|null} - The event object or null if not found
 */
function findEventInReceipt(receipt, eventName) {
    if (!receipt.events) return null;
    
    return receipt.events.find(event => event.event === eventName);
}

/**
 * Alternative method to find events using raw logs when ethers.js event parsing doesn't work
 * @param {Object} receipt - Transaction receipt
 * @param {string} eventSignature - Full event signature e.g. "Transfer(address,address,uint256)"
 * @param {Object} contract - Contract instance for interface information
 * @returns {Object|null} - Parsed event data or null
 */
function findEventInLogs(receipt, eventSignature, contract) {
    if (!receipt.logs || receipt.logs.length === 0) return null;
    
    const eventTopic = ethers.id(eventSignature);
    const log = receipt.logs.find(log => log.topics[0] === eventTopic);
    
    if (!log) return null;
    
    // Get event definition from contract interface
    const eventFragment = contract.interface.getEvent(eventSignature.split('(')[0]);
    
    // Parse the log data
    return contract.interface.decodeEventLog(
        eventFragment,
        log.data,
        log.topics
    );
}

module.exports = {
    findEventInReceipt,
    findEventInLogs
};
