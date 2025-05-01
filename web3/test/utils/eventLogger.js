/**
 * Helper function to log event details from a transaction receipt
 */
function logEvent(receipt, eventName) {
  console.log('------- EVENT DETAILS -------');
  console.log(`Looking for event: ${eventName}`);
  
  if (!receipt || !receipt.events || receipt.events.length === 0) {
    console.log('No named events found in receipt');
    if (receipt && receipt.logs && receipt.logs.length > 0) {
      console.log(`Found ${receipt.logs.length} raw logs:`);
      receipt.logs.forEach((log, index) => {
        console.log(`Log #${index}:`);
        console.log(`  Address: ${log.address}`);
        console.log(`  Topics: ${log.topics.length}`);
        log.topics.forEach((topic, i) => {
          console.log(`    Topic ${i}: ${topic}`);
        });
        console.log(`  Data: ${log.data}`);
      });
    }
    return;
  }

  console.log('All events in receipt:');
  for (let i = 0; i < receipt.events.length; i++) {
    const evt = receipt.events[i];
    console.log(`[${i}] Event: ${evt.event || 'Anonymous'}, Topics: ${evt.topics ? evt.topics.length : 0}`);
  }
}

module.exports = {
  logEvent
};
