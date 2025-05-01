const { expect } = require("chai");
const { ethers } = require("hardhat");
const { logEvent } = require("./utils/eventLogger");

describe("BroadcastSubContract", function () {
  let BroadcastSubContract;
  let broadcastSubContract;
  let parentContractAddr;
  let owner;
  let addr1;
  let addr2;
  
  const version = 1;
  const jsonHash = "0x123abc";
  const softCopyHash = "0x456def";
  const storageLink = "ar://txid123";
  const startDate = Math.floor(Date.now() / 1000);
  const endDate = startDate + 31536000; // +1 year

  beforeEach(async function () {
    // Get contract factories
    BroadcastSubContract = await ethers.getContractFactory("BroadcastSubContract");
    
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Use addr1 as the mock parent contract address
    parentContractAddr = addr1.address;
    
    // Deploy the contract
    broadcastSubContract = await BroadcastSubContract.deploy(
      parentContractAddr,
      owner.address,
      version,
      jsonHash,
      softCopyHash,
      storageLink,
      startDate,
      endDate
    );
  });

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      expect(await broadcastSubContract.broadcastContractAddr()).to.equal(parentContractAddr);
      expect(await broadcastSubContract.owner()).to.equal(owner.address);
      expect(await broadcastSubContract.status()).to.equal(0); // Active
      expect(await broadcastSubContract.version()).to.equal(version);
      expect(await broadcastSubContract.jsonHash()).to.equal(jsonHash);
      expect(await broadcastSubContract.softCopyHash()).to.equal(softCopyHash);
      expect(await broadcastSubContract.storageLink()).to.equal(storageLink);
      expect(await broadcastSubContract.startDate()).to.equal(startDate);
      expect(await broadcastSubContract.endDate()).to.equal(endDate);
      
      const deployTime = await broadcastSubContract.deployTime();
      expect(deployTime).to.be.closeTo(
        BigInt(Math.floor(Date.now() / 1000)),
        60n // Allow 60 seconds tolerance
      );
    });
  });

  describe("Status Update", function () {
    it("Should allow owner to update status", async function () {
      await broadcastSubContract.updateStatus(1); // Disabled
      expect(await broadcastSubContract.status()).to.equal(1);
    });
    
    it("Should allow parent contract to update status", async function () {
      await broadcastSubContract.connect(addr1).updateStatus(1); // Disabled
      expect(await broadcastSubContract.status()).to.equal(1);
    });
    
    it("Should fail when non-owner/non-parent tries to update status", async function () {
      await expect(
        broadcastSubContract.connect(addr2).updateStatus(1)
      ).to.be.revertedWith("Only owner or parent contract can perform this action");
    });
    
    it("Should fail with invalid status value", async function () {
      await expect(
        broadcastSubContract.updateStatus(2)
      ).to.be.revertedWith("Invalid status");
    });

    it("Should emit StatusUpdated event when status is updated", async function () {
      const tx = await broadcastSubContract.updateStatus(1);
      const receipt = await tx.wait();
      
      // Log the event details for debugging
      await logEvent(receipt, "StatusUpdated");
      
      // Check for raw logs instead of parsed events
      expect(receipt.logs.length).to.be.at.least(1);
      
      // Check that the log is our event (based on the event signature)
      const eventTopic = ethers.id("StatusUpdated(address,uint8)");
      expect(receipt.logs[0].topics[0]).to.equal(eventTopic);
      
      // First indexed param is subContractAddr
      expect(receipt.logs[0].topics[1]).to.include(broadcastSubContract.address.toLowerCase().substring(2));
      
      // Status value would be in the data portion
      const decodedData = ethers.AbiCoder.defaultAbiCoder().decode(['uint8'], receipt.logs[0].data);
      expect(decodedData[0]).to.equal(1); // Status.Disabled = 1
    });
  });

  describe("Data Retrieval", function () {
    it("Should get all contract details", async function () {
      const details = await broadcastSubContract.getDetail();
      
      expect(details[0]).to.equal(parentContractAddr); // broadcastContractAddr
      expect(details[1]).to.equal(owner.address); // owner
      expect(details[2]).to.equal(0); // status (Active)
      expect(details[3]).to.equal(version); // version
      expect(details[4]).to.equal(jsonHash); // jsonHash
      expect(details[5]).to.equal(softCopyHash); // softCopyHash
      expect(details[6]).to.equal(storageLink); // storageLink
      expect(details[7]).to.equal(startDate); // startDate
      expect(details[8]).to.equal(endDate); // endDate
      // deployTime check omitted as it's variable
    });
  });
});
