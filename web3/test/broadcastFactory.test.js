const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BroadcastFactory Contract", function () {
  let BroadcastFactory;
  let broadcastFactory;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the contract factories
    BroadcastFactory = await ethers.getContractFactory("BroadcastFactory");
    
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy the contract
    broadcastFactory = await BroadcastFactory.deploy();
  });

  describe("Contract Creation", function () {
    it("Should create a new broadcast contract", async function () {
      const title = "Test Certificate";
      
      // Get contract count before
      const contractsBefore = await broadcastFactory.getAllBroadcastContracts();
      
      // Create contract
      await broadcastFactory.createBroadcastContract(title);
      
      // Get contract count after
      const contractsAfter = await broadcastFactory.getAllBroadcastContracts();
      
      // Verify a contract was added
      expect(contractsAfter.length).to.equal(contractsBefore.length + 1);
      
      // Get the new contract address
      const newContractAddr = contractsAfter[contractsAfter.length - 1];
      
      // Verify it's a valid address (not zero address)
      expect(newContractAddr).to.not.equal("0x0000000000000000000000000000000000000000");
      
      // Verify contract properties if needed
      const BroadcastContract = await ethers.getContractFactory("BroadcastContract");
      const newContract = BroadcastContract.attach(newContractAddr);
      
      expect(await newContract.owner()).to.equal(owner.address);
      expect(await newContract.title()).to.equal(title);
    });
  });

  describe("Contract Retrieval", function () {
    beforeEach(async function () {
      // Create a contract first
      await broadcastFactory.createBroadcastContract("Test Certificate");
    });
    
    it("Should get all broadcast contracts", async function () {
      const contracts = await broadcastFactory.getAllBroadcastContracts();
      expect(contracts.length).to.equal(1);
    });
    
    it("Should get broadcast contract by index", async function () {
      const contracts = await broadcastFactory.getAllBroadcastContracts();
      const contractByIndex = await broadcastFactory.getBroadcastContractByIndex(0);
      expect(contractByIndex).to.equal(contracts[0]);
    });
    
    it("Should fail when trying to get contract with out-of-bounds index", async function () {
      await expect(
        broadcastFactory.getBroadcastContractByIndex(5)
      ).to.be.revertedWith("Index out of bounds");
    });
  });

  describe("Multiple Contracts", function () {
    it("Should create and track multiple contracts", async function () {
      await broadcastFactory.createBroadcastContract("Certificate 1");
      await broadcastFactory.createBroadcastContract("Certificate 2");
      await broadcastFactory.createBroadcastContract("Certificate 3");
      
      const contracts = await broadcastFactory.getAllBroadcastContracts();
      expect(contracts.length).to.equal(3);
    });
  });
});
