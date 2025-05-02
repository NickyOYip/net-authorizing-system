const { ethers, network } = require("hardhat");
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define basic event signatures
const EVENT_SIGNATURES = {
  // MasterFactory events
  'NewVerContractPushed': 'event NewVerContractPushed(string factoryName, uint256 verNo, address indexed masterFactoryAddr, address indexed subFactoryAddr, address indexed ownerAddr)',
  'UsingVer': 'event UsingVer(string factoryName, uint256 verNo, address indexed masterFactoryAddr, address indexed subFactoryAddr, address indexed ownerAddr)',
  
  // BroadcastFactory events
  'NewBroadcastContractOwned': 'event NewBroadcastContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr, string title)',
  
  // PublicFactory events
  'NewPublicContractOwned': 'event NewPublicContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr, string title)',
  
  // PrivateFactory events
  'NewPrivateContractOwned': 'event NewPrivateContractOwned(address indexed factoryAddr, address indexed contractAddr, address indexed ownerAddr, string title)',
  
  // BroadcastContract events
  'NewBroadcastSubContractOwned': 'event NewBroadcastSubContractOwned(address indexed broadcastContractAddr, address indexed subContractAddr, address indexed ownerAddr, uint256 startDate, uint256 endDate)',
  
  // PublicContract events
  'NewPublicSubContractOwned': 'event NewPublicSubContractOwned(address indexed publicContractAddr, address indexed subContractAddr, address indexed ownerAddr, uint256 startDate, uint256 endDate)',
  'PublicContractActivated': 'event PublicContractActivated(address indexed publicContractAddr, address indexed ownerAddr, address indexed userAddr, string title)',
  
  // PrivateContract events
  'NewPrivateSubContractOwned': 'event NewPrivateSubContractOwned(address indexed privateContractAddr, address indexed subContractAddr, address indexed ownerAddr, uint256 startDate, uint256 endDate)',
  'PrivateContractActivated': 'event PrivateContractActivated(address indexed privateContractAddr, address indexed ownerAddr, address indexed userAddr, string title)',
  
  // SubContract events
  'StatusUpdated': 'event StatusUpdated(address indexed subContractAddr, uint8 newStatus)',
  'DataLinksUpdated': 'event DataLinksUpdated(address indexed subContractAddr, address indexed userAddr)',
};

async function main() {
  console.log(`\n----- Event Inspector on ${network.name} -----\n`);
  
  const txHash = await promptQuestion('Enter transaction hash to inspect: ');
  
  try {
    // Fetch the transaction receipt
    const receipt = await ethers.provider.getTransactionReceipt(txHash);
    if (!receipt) {
      console.log('Transaction not found or not yet mined');
      process.exit(1);
    }
    
    console.log(`\nTransaction details:`);
    console.log(`Block: ${receipt.blockNumber}`);
    console.log(`Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    
    // Create interfaces for all event types
    const interfaces = [];
    for (const [name, signature] of Object.entries(EVENT_SIGNATURES)) {
      try {
        const iface = new ethers.utils.Interface([signature]);
        interfaces.push({ name, iface });
      } catch (e) {
        console.log(`Warning: Failed to parse event signature for ${name}`);
      }
    }
    
    console.log(`\nFound ${receipt.logs.length} logs in transaction`);
    
    // Try to parse each log with all interfaces
    let parsedCount = 0;
    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];
      console.log(`\n----- Log #${i} -----`);
      console.log(`Address: ${log.address}`);
      
      let parsed = false;
      for (const { name, iface } of interfaces) {
        try {
          const parsedLog = iface.parseLog(log);
          if (parsedLog) {
            console.log(`Event: ${parsedLog.name} (${name})`);
            console.log('Arguments:');
            
            // Print named arguments
            for (const [key, value] of Object.entries(parsedLog.args)) {
              // Skip numeric keys
              if (!isNaN(parseInt(key))) continue;
              console.log(`  ${key}: ${value.toString()}`);
            }
            
            parsed = true;
            parsedCount++;
            break;
          }
        } catch (e) {
          // Not this event type, continue trying
        }
      }
      
      if (!parsed) {
        console.log('Unable to parse this log with known event signatures');
        console.log('Raw topics:');
        log.topics.forEach((topic, idx) => {
          console.log(`  Topic ${idx}: ${topic}`);
        });
        console.log(`Data: ${log.data}`);
      }
    }
    
    console.log(`\nSuccessfully parsed ${parsedCount} out of ${receipt.logs.length} logs`);
    
  } catch (error) {
    console.error(`Error inspecting transaction: ${error.message}`);
  }
  
  rl.close();
}

function promptQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// Execute the script if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(`Error in main function: ${error.message}`);
      process.exit(1);
    });
}
