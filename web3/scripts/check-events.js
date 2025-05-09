const { ethers, network } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log(`Checking contracts on ${network.name}...`);
  
  try {
    // Get the latest deployment address from the deployment file
    const networkDir = path.join(__dirname, '../deployments', network.name);
    const latestFile = path.join(networkDir, 'latest.json');
    
    if (!fs.existsSync(latestFile)) {
      console.error(`No deployment found for network ${network.name}`);
      console.error(`Please specify contract addresses as arguments: [masterFactory] [broadcastFactory] [publicFactory] [privateFactory]`);
      return;
    }
    
    // Read deployment data or use command line arguments
    const deploymentData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    const masterFactoryAddress = process.argv[2] || deploymentData.masterFactory;
    const broadcastFactoryAddress = process.argv[3] || deploymentData.broadcastFactory;
    const publicFactoryAddress = process.argv[4] || deploymentData.publicFactory;
    const privateFactoryAddress = process.argv[5] || deploymentData.privateFactory;
    
    if (!masterFactoryAddress && !broadcastFactoryAddress && !publicFactoryAddress && !privateFactoryAddress) {
      console.error("No contract addresses found in deployment data or command line arguments.");
      return;
    }
    
    // Get the provider
    const provider = ethers.provider;
    
    // Check MasterFactory
    if (masterFactoryAddress) {
      await checkMasterFactory(masterFactoryAddress);
    }
    
    // Check BroadcastFactory and create test contract if requested
    if (broadcastFactoryAddress) {
      await checkBroadcastFactory(broadcastFactoryAddress, !!process.argv[6]);
    }
    
    // Check PublicFactory and create test contract if requested
    if (publicFactoryAddress) {
      await checkPublicFactory(publicFactoryAddress, !!process.argv[6]);
    }
    
    // Check PrivateFactory and create test contract if requested
    if (privateFactoryAddress) {
      await checkPrivateFactory(privateFactoryAddress, !!process.argv[6]);
    }
    
  } catch (error) {
    console.error("Error checking contracts:", error);
  }
}

async function checkMasterFactory(contractAddress) {
  console.log("\n======= MasterFactory =======");
  console.log(`Contract address: ${contractAddress}`);
  
  try {
    const MasterFactory = await ethers.getContractFactory("MasterFactory");
    const masterFactory = MasterFactory.attach(contractAddress);
    
    // Check code exists
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("❌ No contract code found at this address!");
      return;
    }
    console.log(`✅ Contract code exists (${(code.length - 2) / 2} bytes)`);
    
    // Get owner
    try {
      const owner = await masterFactory.owner();
      console.log(`👤 Contract owner: ${owner}`);
    } catch (error) {
      console.log(`❌ Could not get owner: ${error.message}`);
    }
    
    // Get current versions
    try {
      const currentVersions = await masterFactory.getCurrentVer();
      console.log("\n📋 Current factory versions:");
      console.log(`  Broadcast: ${currentVersions[0]}`);
      console.log(`  Public: ${currentVersions[1]}`);
      console.log(`  Private: ${currentVersions[2]}`);
    } catch (error) {
      console.log(`❌ Error getting current versions: ${error.message}`);
    }
    
    // Get all versions
    try {
      const allVersions = await masterFactory.getAllVer();
      
      console.log("\n📋 All Broadcast factory versions:");
      for (let i = 0; i < allVersions[0].length; i++) {
        console.log(`  ${i}: ${allVersions[0][i]}`);
      }
      
      console.log("\n📋 All Public factory versions:");
      for (let i = 0; i < allVersions[1].length; i++) {
        console.log(`  ${i}: ${allVersions[1][i]}`);
      }
      
      console.log("\n📋 All Private factory versions:");
      for (let i = 0; i < allVersions[2].length; i++) {
        console.log(`  ${i}: ${allVersions[2][i]}`);
      }
    } catch (error) {
      console.log(`❌ Error getting all versions: ${error.message}`);
    }
    
    // Get current version numbers
    try {
      const broadcastVer = await masterFactory.broadcastFactoryCurrentVer();
      const publicVer = await masterFactory.publicFactoryCurrentVer();
      const privateVer = await masterFactory.privateFactoryCurrentVer();
      
      console.log("\n🔢 Current version numbers:");
      console.log(`  Broadcast: ${broadcastVer}`);
      console.log(`  Public: ${publicVer}`);
      console.log(`  Private: ${privateVer}`);
    } catch (error) {
      console.log(`❌ Error getting version numbers: ${error.message}`);
    }
    
  } catch (error) {
    console.error(`❌ Error checking MasterFactory:`, error);
  }
}

async function checkBroadcastFactory(contractAddress, createTest = false) {
  console.log("\n======= BroadcastFactory =======");
  console.log(`Contract address: ${contractAddress}`);
  
  try {
    const BroadcastFactory = await ethers.getContractFactory("BroadcastFactory");
    const broadcastFactory = BroadcastFactory.attach(contractAddress);
    
    // Check code exists
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("❌ No contract code found at this address!");
      return;
    }
    console.log(`✅ Contract code exists (${(code.length - 2) / 2} bytes)`);
    
    // Get all contracts
    try {
      const contracts = await broadcastFactory.getAllBroadcastContracts();
      console.log(`📋 Total contracts created: ${contracts.length}`);
      
      if (contracts.length > 0) {
        console.log("\n📄 Contract addresses:");
        for (let i = 0; i < contracts.length; i++) {
          console.log(`  ${i}: ${contracts[i]}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error getting contracts: ${error.message}`);
    }
    
    // Create test contract if requested
    if (createTest) {
      try {
        console.log("\n🔨 Creating test broadcast contract...");
        const title = "Test Broadcast " + new Date().toISOString();
        
        const tx = await broadcastFactory.createBroadcastContract(title);
        console.log(`📝 Transaction hash: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        
        // Check if contract was added
        const contractsAfter = await broadcastFactory.getAllBroadcastContracts();
        console.log(`📋 Total contracts now: ${contractsAfter.length}`);
        
        if (contractsAfter.length > 0) {
          const newContract = contractsAfter[contractsAfter.length - 1];
          console.log(`📄 New contract address: ${newContract}`);
          
          // Add a sub-contract
          console.log("\n🔨 Creating test broadcast sub-contract...");
          const BroadcastContract = await ethers.getContractFactory("BroadcastContract");
          const broadcastContract = BroadcastContract.attach(newContract);
          
          const jsonHash = "0x123abc";
          const softCopyHash = "0x456def";
          const storageLink = "ar://txid123";
          const startDate = Math.floor(Date.now() / 1000);
          const endDate = startDate + 31536000; // +1 year
          
          const subTx = await broadcastContract.addNewBroadcastSubContract(
            jsonHash,
            softCopyHash,
            storageLink,
            startDate,
            endDate
          );
          console.log(`📝 Sub-contract transaction hash: ${subTx.hash}`);
          
          const subReceipt = await subTx.wait();
          console.log(`✅ Sub-contract transaction confirmed in block ${subReceipt.blockNumber}`);
          
          // Get the sub-contract
          const totalVerNo = await broadcastContract.totalVerNo();
          console.log(`📋 Total versions: ${totalVerNo}`);
          
          const activeVer = await broadcastContract.activeVer();
          console.log(`🔢 Active version: ${activeVer}`);
          
          const subContractAddr = await broadcastContract.getBroadcastContractByIndex(1);
          console.log(`📄 Sub-contract address: ${subContractAddr}`);
        }
      } catch (error) {
        console.log(`❌ Error creating test contract: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error checking BroadcastFactory:`, error);
  }
}

async function checkPublicFactory(contractAddress, createTest = false) {
  console.log("\n======= PublicFactory =======");
  console.log(`Contract address: ${contractAddress}`);
  
  try {
    const PublicFactory = await ethers.getContractFactory("PublicFactory");
    const publicFactory = PublicFactory.attach(contractAddress);
    
    // Check code exists
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("❌ No contract code found at this address!");
      return;
    }
    console.log(`✅ Contract code exists (${(code.length - 2) / 2} bytes)`);
    
    // Get all contracts
    try {
      const contracts = await publicFactory.getAllPublicContracts();
      console.log(`📋 Total contracts created: ${contracts.length}`);
      
      if (contracts.length > 0) {
        console.log("\n📄 Contract addresses:");
        for (let i = 0; i < contracts.length; i++) {
          console.log(`  ${i}: ${contracts[i]}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error getting contracts: ${error.message}`);
    }
    
    // Create test contract if requested
    if (createTest) {
      try {
        console.log("\n🔨 Creating test public contract...");
        const title = "Test Public " + new Date().toISOString();
        const activationCode = "secret123";
        
        const tx = await publicFactory.createPublicContract(title, activationCode);
        console.log(`📝 Transaction hash: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        
        // Check if contract was added
        const contractsAfter = await publicFactory.getAllPublicContracts();
        console.log(`📋 Total contracts now: ${contractsAfter.length}`);
        
        if (contractsAfter.length > 0) {
          const newContract = contractsAfter[contractsAfter.length - 1];
          console.log(`📄 New contract address: ${newContract}`);
          
          // Add a sub-contract
          console.log("\n🔨 Creating test public sub-contract...");
          const PublicContract = await ethers.getContractFactory("PublicContract");
          const publicContract = PublicContract.attach(newContract);
          
          const jsonHash = "0x123abc";
          const softCopyHash = "0x456def";
          const storageLink = "ar://txid123";
          const startDate = Math.floor(Date.now() / 1000);
          const endDate = startDate + 31536000; // +1 year
          
          const subTx = await publicContract.addNewPublicSubContract(
            jsonHash,
            softCopyHash,
            storageLink,
            startDate,
            endDate
          );
          console.log(`📝 Sub-contract transaction hash: ${subTx.hash}`);
          
          const subReceipt = await subTx.wait();
          console.log(`✅ Sub-contract transaction confirmed in block ${subReceipt.blockNumber}`);
          
          // Get the sub-contract
          const totalVerNo = await publicContract.totalVerNo();
          console.log(`📋 Total versions: ${totalVerNo}`);
          
          const activeVer = await publicContract.activeVer();
          console.log(`🔢 Active version: ${activeVer}`);
          
          const subContractAddr = await publicContract.getPublicContractByIndex(1);
          console.log(`📄 Sub-contract address: ${subContractAddr}`);
          
          // Test activation
          console.log("\n🔑 Testing contract activation...");
          console.log(`Activation code: ${activationCode}`);
          
          const signer = (await ethers.getSigners())[1]; // Use different signer
          const userContract = publicContract.connect(signer);
          
          console.log(`Activating with address: ${signer.address}`);
          const activateTx = await userContract.activate(activationCode);
          console.log(`📝 Activation transaction hash: ${activateTx.hash}`);
          
          const activateReceipt = await activateTx.wait();
          console.log(`✅ Activation confirmed in block ${activateReceipt.blockNumber}`);
          
          const user = await publicContract.user();
          console.log(`👤 Contract user now set to: ${user}`);
        }
      } catch (error) {
        console.log(`❌ Error creating test contract: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error checking PublicFactory:`, error);
  }
}

async function checkPrivateFactory(contractAddress, createTest = false) {
  console.log("\n======= PrivateFactory =======");
  console.log(`Contract address: ${contractAddress}`);
  
  try {
    const PrivateFactory = await ethers.getContractFactory("PrivateFactory");
    const privateFactory = PrivateFactory.attach(contractAddress);
    
    // Check code exists
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("❌ No contract code found at this address!");
      return;
    }
    console.log(`✅ Contract code exists (${(code.length - 2) / 2} bytes)`);
    
    // Get all contracts
    try {
      const contracts = await privateFactory.getAllPrivateContracts();
      console.log(`📋 Total contracts created: ${contracts.length}`);
      
      if (contracts.length > 0) {
        console.log("\n📄 Contract addresses:");
        for (let i = 0; i < contracts.length; i++) {
          console.log(`  ${i}: ${contracts[i]}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error getting contracts: ${error.message}`);
    }
    
    // Create test contract if requested
    if (createTest) {
      try {
        console.log("\n🔨 Creating test private contract...");
        const title = "Test Private " + new Date().toISOString();
        const activationCode = "secret123";
        
        const tx = await privateFactory.createPrivateContract(title, activationCode);
        console.log(`📝 Transaction hash: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        
        // Check if contract was added
        const contractsAfter = await privateFactory.getAllPrivateContracts();
        console.log(`📋 Total contracts now: ${contractsAfter.length}`);
        
        if (contractsAfter.length > 0) {
          const newContract = contractsAfter[contractsAfter.length - 1];
          console.log(`📄 New contract address: ${newContract}`);
          
          // Add a sub-contract
          console.log("\n🔨 Creating test private sub-contract...");
          const PrivateContract = await ethers.getContractFactory("PrivateContract");
          const privateContract = PrivateContract.attach(newContract);
          
          const jsonHash = "0x123abc";
          const softCopyHash = "0x456def";
          const startDate = Math.floor(Date.now() / 1000);
          const endDate = startDate + 31536000; // +1 year
          
          const subTx = await privateContract.addNewPrivateSubContract(
            jsonHash,
            softCopyHash,
            startDate,
            endDate
          );
          console.log(`📝 Sub-contract transaction hash: ${subTx.hash}`);
          
          const subReceipt = await subTx.wait();
          console.log(`✅ Sub-contract transaction confirmed in block ${subReceipt.blockNumber}`);
          
          // Get the sub-contract
          const totalVerNo = await privateContract.totalVerNo();
          console.log(`📋 Total versions: ${totalVerNo}`);
          
          const activeVer = await privateContract.activeVer();
          console.log(`🔢 Active version: ${activeVer}`);
          
          const subContractAddr = await privateContract.getPrivateContractByIndex(1);
          console.log(`📄 Sub-contract address: ${subContractAddr}`);
          
          // Test activation
          console.log("\n🔑 Testing contract activation...");
          console.log(`Activation code: ${activationCode}`);
          
          const signer = (await ethers.getSigners())[1]; // Use different signer
          const userContract = privateContract.connect(signer);
          
          console.log(`Activating with address: ${signer.address}`);
          const activateTx = await userContract.activate(activationCode);
          console.log(`📝 Activation transaction hash: ${activateTx.hash}`);
          
          const activateReceipt = await activateTx.wait();
          console.log(`✅ Activation confirmed in block ${activateReceipt.blockNumber}`);
          
          const user = await privateContract.user();
          console.log(`👤 Contract user now set to: ${user}`);
          
          // Test data link update
          console.log("\n📋 Testing data link update...");
          
          const PrivateSubContract = await ethers.getContractFactory("PrivateSubContract");
          const privateSubContract = PrivateSubContract.attach(subContractAddr);
          
          const userSubContract = privateSubContract.connect(signer);
          
          const jsonLink = "ar://encrypted-json-txid";
          const softCopyLink = "ar://encrypted-softcopy-txid";
          
          const linkTx = await userSubContract.updateDataLinks(jsonLink, softCopyLink);
          console.log(`📝 Data link update transaction hash: ${linkTx.hash}`);
          
          const linkReceipt = await linkTx.wait();
          console.log(`✅ Data link update confirmed in block ${linkReceipt.blockNumber}`);
          
          const savedJsonLink = await privateSubContract.jsonLink();
          const savedSoftCopyLink = await privateSubContract.softCopyLink();
          
          console.log(`📄 Saved JSON link: ${savedJsonLink}`);
          console.log(`📄 Saved soft copy link: ${savedSoftCopyLink}`);
        }
      } catch (error) {
        console.log(`❌ Error creating test contract: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error checking PrivateFactory:`, error);
  }
}

// Execute the check
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
