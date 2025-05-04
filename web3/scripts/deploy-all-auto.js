const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const contractsDir = path.join(__dirname, "../contracts");

// Track deployed contracts
const deployedContracts = {
  factories: {},
  contracts: {},
  timestamp: new Date().toISOString()
};

function extractContractName(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const match = content.match(/contract\s+(\w+)/);
  if (!match) throw new Error(`❌ No contract found in ${filePath}`);
  return match[1];
}

function getConstructorArgs(contractName, deployerAddress, parentContract = null) {
  const sampleTitle = "Sample Contract";
  const sampleActivationCode = "123456"; // For testing purposes
  const now = Math.floor(Date.now() / 1000);
  const oneYearLater = now + 365 * 24 * 60 * 60;
  
  switch (contractName) {
    case "MasterFactory":
    case "BroadcastFactory":
    case "PublicFactory":
    case "PrivateFactory":
      return [];

    case "BroadcastContract":
      return [deployerAddress, sampleTitle];

    case "PublicContract":
    case "PrivateContract":
      return [deployerAddress, sampleTitle, sampleActivationCode];

    case "BroadcastSubContract":
      return [
        parentContract, // broadcastContractAddr
        deployerAddress, // owner
        1, // version
        "sample_json_hash", // jsonHash
        "sample_softcopy_hash", // softCopyHash
        "ipfs://sample_storage_link", // storageLink
        now, // startDate
        oneYearLater // endDate
      ];

    case "PublicSubContract":
      return [
        parentContract, // publicContractAddr
        deployerAddress, // owner
        "0x0000000000000000000000000000000000000000", // user (null until activated)
        1, // version
        "sample_json_hash",
        "sample_softcopy_hash",
        "ipfs://sample_storage_link",
        now,
        oneYearLater
      ];

    case "PrivateSubContract":
      return [
        parentContract, // privateContractAddr
        deployerAddress, // owner
        "0x0000000000000000000000000000000000000000", // user (null until activated)
        1, // version
        "sample_json_hash",
        "sample_softcopy_hash",
        now,
        oneYearLater
      ];

    default:
      return [];
  }
}

async function deployAndVerify(contractName) {
  try {
    console.log(`🚀 Deploying: ${contractName}`);
    
    const [deployer] = await hre.ethers.getSigners();
    const constructorArgs = getConstructorArgs(contractName, deployer.address);
    
    const ContractFactory = await hre.ethers.getContractFactory(contractName);
    const contract = await ContractFactory.deploy(...constructorArgs);
    
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    
    console.log(`✅ Deployed ${contractName} at ${address}`);

    // Store deployment info
    if (contractName.includes("Factory")) {
      deployedContracts.factories[contractName] = address;
    } else {
      deployedContracts.contracts[contractName] = address;
    }

    console.log("⏳ Waiting 60s for Etherscan indexing...");
    await new Promise((resolve) => setTimeout(resolve, 60000));

    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs,
    });

    console.log(`🎉 Verified: ${contractName} on Etherscan\n`);
    return address;
  } catch (error) {
    console.warn(`⚠️ Failed on ${contractName}: ${error.message}\n`);
    return null;
  }
}

async function deploySubContract(contractName, parentAddress) {
  try {
    console.log(`🚀 Deploying: ${contractName} under parent ${parentAddress}`);
    
    const [deployer] = await hre.ethers.getSigners();
    const constructorArgs = getConstructorArgs(contractName, deployer.address, parentAddress);
    
    const ContractFactory = await hre.ethers.getContractFactory(contractName);
    const contract = await ContractFactory.deploy(...constructorArgs);
    
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    
    console.log(`✅ Deployed ${contractName} at ${address}`);

    // Store deployment info
    if (!deployedContracts.subContracts) {
      deployedContracts.subContracts = {};
    }
    deployedContracts.subContracts[address] = {
      type: contractName,
      address: address,
      parent: parentAddress,
      constructorArgs: constructorArgs
    };

    console.log("⏳ Waiting 60s for Etherscan indexing...");
    await new Promise((resolve) => setTimeout(resolve, 60000));

    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs,
    });

    console.log(`🎉 Verified: ${contractName} on Etherscan\n`);
    return address;
  } catch (error) {
    console.warn(`⚠️ Failed on ${contractName}: ${error.message}\n`);
    return null;
  }
}

async function saveDeployment(network) {
  const deploymentsDir = path.join(__dirname, "../deployments");
  const networkDir = path.join(deploymentsDir, network);
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  if (!fs.existsSync(networkDir)) {
    fs.mkdirSync(networkDir);
  }

  // Save latest deployment
  fs.writeFileSync(
    path.join(networkDir, "latest.json"),
    JSON.stringify(deployedContracts, null, 2)
  );

  // Save timestamped deployment
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  fs.writeFileSync(
    path.join(networkDir, `deployment-${timestamp}.json`),
    JSON.stringify(deployedContracts, null, 2)
  );

  console.log("📝 Deployment addresses saved to deployments directory");
}

async function main() {
  const network = hre.network.name;
  console.log(`🌐 Network: ${network}`);

  // Deploy factory contracts first
  console.log("📦 Deploying factory contracts...");
  const factoryContracts = [
    "MasterFactory",
    "BroadcastFactory",
    "PublicFactory",
    "PrivateFactory"
  ];

  for (const contractName of factoryContracts) {
    await deployAndVerify(contractName);
  }

  // Configure MasterFactory
  if (deployedContracts.factories.MasterFactory) {
    console.log("⚙️ Configuring MasterFactory...");
    const masterFactory = await hre.ethers.getContractAt(
      "MasterFactory",
      deployedContracts.factories.MasterFactory
    );

    // Add factory versions
    if (deployedContracts.factories.BroadcastFactory) {
      await (await masterFactory.addBroadcastFactoryVer(deployedContracts.factories.BroadcastFactory)).wait();
      await (await masterFactory.updateBroadcastFactoryVer(0)).wait();
    }
    if (deployedContracts.factories.PublicFactory) {
      await (await masterFactory.addPublicFactoryVer(deployedContracts.factories.PublicFactory)).wait();
      await (await masterFactory.updatePublicFactoryVer(0)).wait();
    }
    if (deployedContracts.factories.PrivateFactory) {
      await (await masterFactory.addPrivateFactoryVer(deployedContracts.factories.PrivateFactory)).wait();
      await (await masterFactory.updatePrivateFactoryVer(0)).wait();
    }
  }

  // Deploy main contracts
  console.log("📦 Deploying main contracts...");
  const mainContracts = [
    "BroadcastContract",
    "PublicContract",
    "PrivateContract"
  ];

  for (const contractName of mainContracts) {
    await deployAndVerify(contractName);
  }

  // Deploy sample sub contracts
  console.log("📦 Deploying sample sub contracts...");
  
  if (deployedContracts.contracts.BroadcastContract) {
    await deploySubContract(
      "BroadcastSubContract", 
      deployedContracts.contracts.BroadcastContract
    );
  }

  if (deployedContracts.contracts.PublicContract) {
    await deploySubContract(
      "PublicSubContract",
      deployedContracts.contracts.PublicContract
    );
  }

  if (deployedContracts.contracts.PrivateContract) {
    await deploySubContract(
      "PrivateSubContract",
      deployedContracts.contracts.PrivateContract
    );
  }

  // Save deployment information
  await saveDeployment(network);
}

main().catch((err) => {
  console.error("❌ Deployment script failed:", err);
  process.exitCode = 1;
});

