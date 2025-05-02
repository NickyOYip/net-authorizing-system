const { ethers, network } = require("hardhat");
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log(`\n----- Simple Transaction Inspector on ${network.name} -----\n`);
  
  // Verify we're on a testnet
  if (network.name === 'localhost' || network.name === 'hardhat') {
    console.error('This script should be run on a testnet network. Use --network sepolia');
    process.exit(1);
  }
  
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
    console.log(`From: ${receipt.from}`);
    console.log(`To: ${receipt.to}`);
    
    // Display raw logs without attempting to parse them
    if (receipt.logs && receipt.logs.length > 0) {
      console.log(`\nFound ${receipt.logs.length} event logs:`);
      
      receipt.logs.forEach((log, i) => {
        console.log(`\n----- Log #${i} -----`);
        console.log(`Address: ${log.address}`);
        console.log(`Topics Count: ${log.topics.length}`);
        
        log.topics.forEach((topic, j) => {
          console.log(`Topic ${j}: ${topic}`);
          
          // For topic 0 (event signature), try to show some known events
          if (j === 0) {
            const knownTopics = {
              '0x34c7ba1456cede6c3f73063d5d3416a99cf7dd1986f7c356eb619cbb5a750b40': 'NewBroadcastContractOwned',
              '0x53f8aefd6fba4b1e18eef4c433a2d384e57b809179059cca3c8f99dafda029ca': 'NewPublicContractOwned',
              '0x531f2b37172c279cc0cecb93c49e56f870ff7cf2e41e566e78c25292fe5f3266': 'NewPrivateContractOwned',
              '0xdf2cdb0f7075f538161058c29fcc881abb4c0088802e045db13aed440091166d': 'NewBroadcastSubContractOwned',
              '0x94597551b00c42c24f90ea0707d4838f1527097507489491c7f4f5f55e4ac1d9': 'NewPublicSubContractOwned', 
              '0x6dbf1d8aaf26a09379a16b409dbcac36da2297b50e8c99e4233e5ae4e1fa9305': 'NewPrivateSubContractOwned',
              '0xf48532d98ae61b81a85f8950e73114ff4a4634e10e76472a983c249ee7af949b': 'PublicContractActivated',
              '0x2c0a248c5dd1f262bcf79a9bb3d4c31bd169c70a5d2a9cff1359fb7cf797c7a8': 'PrivateContractActivated',
              '0x24cb0e4e2aa7bc3df3b96472fea72bc7a35cea559f2cc092ca9cb567e8f78941': 'StatusUpdated',
              '0x35d16a83c5e62cfec58e0bee3de1df4dac7563c1e112bf049b56e9f897fd565e': 'DataLinksUpdated'
            };
            
            const eventName = knownTopics[topic] || 'Unknown Event';
            console.log(`   ^ Likely event: ${eventName}`);
          }
          
          // For other topics (typically indexed params), try to extract the address if it's an address
          if (j > 0) {
            const potentialAddress = '0x' + topic.slice(-40);
            if (potentialAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
              console.log(`   ^ Potential address: ${potentialAddress}`);
            }
          }
        });
        
        console.log(`Data: ${log.data}`);
        
        // Try to decode data if it's simple enough
        if (log.data && log.data.length > 2) {
          try {
            if (log.data.length === 66) { // Likely a single uint256 or address
              const bigIntValue = BigInt(log.data);
              console.log(`   ^ Data as number: ${bigIntValue.toString()}`);
              
              // If it's a timestamp, show as date
              if (bigIntValue > 1000000000 && bigIntValue < 10000000000) {
                const date = new Date(Number(bigIntValue) * 1000);
                console.log(`   ^ Potential timestamp: ${date.toISOString()}`);
              }
            } else if (log.data.length > 130) { // Potentially multiple params
              console.log('   ^ Multiple parameters in data (not decoded)');
            }
          } catch (e) {
            // Ignore decoding errors
          }
        }
      });
    } else {
      console.log('\nNo event logs found in this transaction');
    }
    
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
