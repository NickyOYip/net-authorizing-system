const { expect } = require("chai");
const { ethers } = require("hardhat");
const { logEvent } = require("./utils/eventLogger");

describe("MasterFactory Contract", function () {
  let MasterFactory;
  let masterFactory;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the contract factories
    MasterFactory = await ethers.getContractFactory("MasterFactory");
    
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy the contract
    masterFactory = await MasterFactory.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await masterFactory.owner()).to.equal(owner.address);
    });
    
    it("Should start with no factories", async function () {
      const currentVers = await masterFactory.getAllVer();
      expect(currentVers[0]).to.be.an('array').that.is.empty;
      expect(currentVers[1]).to.be.an('array').that.is.empty;
      expect(currentVers[2]).to.be.an('array').that.is.empty;
    });
  });

  describe("Factory version management", function () {
    it("Should add new broadcast factory version", async function () {
      await masterFactory.addBroadcastFactoryVer(addr1.address);
      const currentVers = await masterFactory.getAllVer();
      expect(currentVers[0].length).to.equal(1);
      expect(currentVers[0][0]).to.equal(addr1.address);
    });
    
    it("Should add new public factory version", async function () {
      await masterFactory.addPublicFactoryVer(addr1.address);
      const currentVers = await masterFactory.getAllVer();
      expect(currentVers[1].length).to.equal(1);
      expect(currentVers[1][0]).to.equal(addr1.address);
    });
    
    it("Should add new private factory version", async function () {
      await masterFactory.addPrivateFactoryVer(addr1.address);
      const currentVers = await masterFactory.getAllVer();
      expect(currentVers[2].length).to.equal(1);
      expect(currentVers[2][0]).to.equal(addr1.address);
    });
    
    it("Should update current broadcast factory version", async function () {
      await masterFactory.addBroadcastFactoryVer(addr1.address);
      await masterFactory.addBroadcastFactoryVer(addr2.address);
      await masterFactory.updateBroadcastFactoryVer(1);
      const currentVer = await masterFactory.broadcastFactoryCurrentVer();
      expect(currentVer).to.equal(1);
    });
    
    it("Should update current public factory version", async function () {
      await masterFactory.addPublicFactoryVer(addr1.address);
      await masterFactory.addPublicFactoryVer(addr2.address);
      await masterFactory.updatePublicFactoryVer(1);
      const currentVer = await masterFactory.publicFactoryCurrentVer();
      expect(currentVer).to.equal(1);
    });
    
    it("Should update current private factory version", async function () {
      await masterFactory.addPrivateFactoryVer(addr1.address);
      await masterFactory.addPrivateFactoryVer(addr2.address);
      await masterFactory.updatePrivateFactoryVer(1);
      const currentVer = await masterFactory.privateFactoryCurrentVer();
      expect(currentVer).to.equal(1);
    });
    
    it("Should emit NewVerContractPushed event when adding broadcast factory version", async function () {
      console.log("Starting test for NewVerContractPushed event...");
      
      const tx = await masterFactory.addBroadcastFactoryVer(addr1.address);
      console.log("Transaction hash:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction mined. Receipt status:", receipt.status);
      
      // Log all events in the receipt
      await logEvent(receipt, "NewVerContractPushed");
      
      // Let's check the raw receipt for events
      console.log("Raw events count:", receipt.events ? receipt.events.length : 0);
      
      if (receipt.events && receipt.events.length > 0) {
        // For anonymous events, check if it contains the expected data
        receipt.events.forEach((evt, idx) => {
          console.log(`Event #${idx}: ${evt.event || 'Anonymous'}`);
          if (evt.topics) {
            console.log(`  Topics: ${evt.topics.length}`);
            evt.topics.forEach((topic, i) => {
              console.log(`    Topic ${i}: ${topic}`);
            });
          }
          if (evt.data) {
            console.log(`  Data: ${evt.data}`);
          }
        });
      }
      
      // Check if the event exists at all
      const hasNewVerEvent = receipt.events && receipt.events.some(e => 
        e.event === "NewVerContractPushed"
      );
      
      expect(hasNewVerEvent).to.be.true;
      
      if (hasNewVerEvent) {
        const eventData = receipt.events.find(e => e.event === "NewVerContractPushed");
        
        // Check individual arguments
        expect(eventData.args[0]).to.equal("BroadcastFactory"); // Factory name
        expect(eventData.args[1]).to.equal(0); // Version number
        // Skip arg[2] which is the contract address that varies
        expect(eventData.args[3]).to.equal(addr1.address); // Factory address
        expect(eventData.args[4]).to.equal(owner.address); // Owner address
      }
    });
    
    it("Should emit NewVerContractPushed event when adding public factory version", async function () {
      const tx = await masterFactory.addPublicFactoryVer(addr1.address);
      const receipt = await tx.wait();
      await logEvent(receipt, "NewVerContractPushed");
      const newVerEvent = receipt.events.find(e => e.event === "NewVerContractPushed");
      expect(newVerEvent).to.not.be.undefined;
      expect(newVerEvent.args[0]).to.equal("PublicFactory"); // Factory name
      expect(newVerEvent.args[1]).to.equal(0); // Version number
      expect(newVerEvent.args[3]).to.equal(addr1.address); // Factory address
      expect(newVerEvent.args[4]).to.equal(owner.address); // Owner address
    });
    
    it("Should emit NewVerContractPushed event when adding private factory version", async function () {
      const tx = await masterFactory.addPrivateFactoryVer(addr1.address);
      const receipt = await tx.wait();
      await logEvent(receipt, "NewVerContractPushed");
      const newVerEvent = receipt.events.find(e => e.event === "NewVerContractPushed");
      expect(newVerEvent).to.not.be.undefined;
      expect(newVerEvent.args[0]).to.equal("PrivateFactory"); // Factory name
      expect(newVerEvent.args[1]).to.equal(0); // Version number
      expect(newVerEvent.args[3]).to.equal(addr1.address); // Factory address
      expect(newVerEvent.args[4]).to.equal(owner.address); // Owner address
    });
    
    it("Should emit UsingVer event when updating broadcast factory version", async function () {
      await masterFactory.addBroadcastFactoryVer(addr1.address);
      await masterFactory.addBroadcastFactoryVer(addr2.address);
      
      await expect(masterFactory.updateBroadcastFactoryVer(1))
        .to.emit(masterFactory, "UsingVer")
        .withArgs(
          "BroadcastFactory", 
          1, 
          ethers.anyValue, 
          addr2.address, 
          owner.address
        );
    });
    
    it("Should emit UsingVer event when updating public factory version", async function () {
      await masterFactory.addPublicFactoryVer(addr1.address);
      await masterFactory.addPublicFactoryVer(addr2.address);
      
      await expect(masterFactory.updatePublicFactoryVer(1))
        .to.emit(masterFactory, "UsingVer")
        .withArgs(
          "PublicFactory", 
          1, 
          ethers.anyValue, 
          addr2.address, 
          owner.address
        );
    });
    
    it("Should emit UsingVer event when updating private factory version", async function () {
      await masterFactory.addPrivateFactoryVer(addr1.address);
      await masterFactory.addPrivateFactoryVer(addr2.address);
      
      await expect(masterFactory.updatePrivateFactoryVer(1))
        .to.emit(masterFactory, "UsingVer")
        .withArgs(
          "PrivateFactory", 
          1, 
          ethers.anyValue, 
          addr2.address, 
          owner.address
        );
    });
  });

  describe("Access control", function () {
    it("Should fail when non-owner tries to add a factory version", async function () {
      await expect(
        masterFactory.connect(addr1).addBroadcastFactoryVer(addr2.address)
      ).to.be.revertedWith("Only owner can perform this action");
    });
    
    it("Should fail when non-owner tries to update a factory version", async function () {
      await masterFactory.addBroadcastFactoryVer(addr1.address);
      await expect(
        masterFactory.connect(addr1).updateBroadcastFactoryVer(0)
      ).to.be.revertedWith("Only owner can perform this action");
    });
  });

  describe("Version retrieval", function () {
    it("Should return current versions", async function () {
      await masterFactory.addBroadcastFactoryVer(addr1.address);
      await masterFactory.addPublicFactoryVer(addr2.address);
      const addr3 = ethers.Wallet.createRandom().address;
      await masterFactory.addPrivateFactoryVer(addr3);
      
      await masterFactory.updateBroadcastFactoryVer(0);
      await masterFactory.updatePublicFactoryVer(0);
      await masterFactory.updatePrivateFactoryVer(0);
      
      const currentVers = await masterFactory.getCurrentVer();
      expect(currentVers[0]).to.equal(addr1.address);
      expect(currentVers[1]).to.equal(addr2.address);
      expect(currentVers[2]).to.equal(addr3);
    });
  });
});
