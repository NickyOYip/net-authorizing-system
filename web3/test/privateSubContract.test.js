const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivateSubContract", function () {
  let PrivateSubContract;
  let privateSubContract;
  let parentContractAddr;
  let owner;
  let user;
  let addr1;
  
  const version = 1;
  const jsonHash = "0x123abc";
  const softCopyHash = "0x456def";
  const startDate = Math.floor(Date.now() / 1000);
  const endDate = startDate + 31536000; // +1 year

  beforeEach(async function () {
    // Get contract factories
    PrivateSubContract = await ethers.getContractFactory("PrivateSubContract");
    
    // Get signers
    [owner, user, addr1] = await ethers.getSigners();
    
    // Use addr1 as the mock parent contract address
    parentContractAddr = addr1.address;
    
    // Initially user is zero address (not activated)
    const initialUser = ethers.ZeroAddress;
    
    // Deploy the contract
    privateSubContract = await PrivateSubContract.deploy(
      parentContractAddr,
      owner.address,
      initialUser,
      version,
      jsonHash,
      softCopyHash,
      startDate,
      endDate
    );
  });

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      expect(await privateSubContract.privateContractAddr()).to.equal(parentContractAddr);
      expect(await privateSubContract.parent()).to.equal(parentContractAddr);
      expect(await privateSubContract.owner()).to.equal(owner.address);
      expect(await privateSubContract.user()).to.equal(ethers.ZeroAddress);
      expect(await privateSubContract.status()).to.equal(0); // Active
      expect(await privateSubContract.version()).to.equal(version);
      expect(await privateSubContract.jsonHash()).to.equal(jsonHash);
      expect(await privateSubContract.softCopyHash()).to.equal(softCopyHash);
      expect(await privateSubContract.jsonLink()).to.equal(""); // Empty initially
      expect(await privateSubContract.softCopyLink()).to.equal(""); // Empty initially
      expect(await privateSubContract.startDate()).to.equal(startDate);
      expect(await privateSubContract.endDate()).to.equal(endDate);
      
      const deployTime = await privateSubContract.deployTime();
      expect(deployTime).to.be.closeTo(
        BigInt(Math.floor(Date.now() / 1000)),
        60n // Allow 60 seconds tolerance
      );
    });
  });

  describe("Status Update", function () {
    it("Should allow owner to update status", async function () {
      await privateSubContract.updateStatus(1); // Disabled
      expect(await privateSubContract.status()).to.equal(1);
    });
    
    it("Should allow parent contract to update status", async function () {
      await privateSubContract.connect(addr1).updateStatus(1); // Disabled
      expect(await privateSubContract.status()).to.equal(1);
    });
    
    it("Should fail when non-owner/non-parent tries to update status", async function () {
      await expect(
        privateSubContract.connect(user).updateStatus(1)
      ).to.be.revertedWith("Only owner or parent contract can perform this action");
    });
    
    it("Should fail with invalid status value", async function () {
      await expect(
        privateSubContract.updateStatus(2)
      ).to.be.revertedWith("Invalid status");
    });
    
    it("Should emit StatusUpdated event when status is updated", async function () {
      await expect(privateSubContract.updateStatus(1))
        .to.emit(privateSubContract, "StatusUpdated")
        .withArgs(ethers.anyValue, 1);
    });
  });

  describe("User and Data Management", function () {
    beforeEach(async function () {
      // Set user address
      await privateSubContract.connect(addr1).setUser(user.address);
    });
    
    it("Should allow parent to set user", async function () {
      expect(await privateSubContract.user()).to.equal(user.address);
    });
    
    it("Should allow user to update data links", async function () {
      const jsonLink = "ar://encrypted-json-txid";
      const softCopyLink = "ar://encrypted-softcopy-txid";
      
      // Update data links
      console.log("Calling updateDataLinks from:", user.address);
      await privateSubContract.connect(user).updateDataLinks(jsonLink, softCopyLink);
      
      // Verify links were updated correctly
      expect(await privateSubContract.jsonLink()).to.equal(jsonLink);
      expect(await privateSubContract.softCopyLink()).to.equal(softCopyLink);
    });
    
    it("Should fail when non-user tries to update data links", async function () {
      await expect(
        privateSubContract.connect(owner).updateDataLinks("link1", "link2")
      ).to.be.revertedWith("Only user can perform this action");
    });
    
    it("Should emit DataLinksUpdated event when data links are updated", async function () {
      await privateSubContract.connect(addr1).setUser(user.address);
      
      const jsonLink = "ar://encrypted-json-txid";
      const softCopyLink = "ar://encrypted-softcopy-txid";
      
      await expect(privateSubContract.connect(user).updateDataLinks(jsonLink, softCopyLink))
        .to.emit(privateSubContract, "DataLinksUpdated")
        .withArgs(ethers.anyValue, user.address);
    });
  });

  describe("Data Retrieval", function () {
    it("Should get all contract details", async function () {
      // First set some data
      await privateSubContract.connect(addr1).setUser(user.address);
      await privateSubContract.connect(user).updateDataLinks("ar://json", "ar://softcopy");
      
      const details = await privateSubContract.getDetail();
      
      expect(details[0]).to.equal(parentContractAddr); // privateContractAddr
      expect(details[1]).to.equal(owner.address); // owner
      expect(details[2]).to.equal(parentContractAddr); // parent
      expect(details[3]).to.equal(user.address); // user
      expect(details[4]).to.equal(0); // status (Active)
      expect(details[5]).to.equal(version); // version
      expect(details[6]).to.equal(jsonHash); // jsonHash
      expect(details[7]).to.equal(softCopyHash); // softCopyHash
      expect(details[8]).to.equal("ar://json"); // jsonLink
      expect(details[9]).to.equal("ar://softcopy"); // softCopyLink
      expect(details[10]).to.equal(startDate); // startDate
      expect(details[11]).to.equal(endDate); // endDate
      // deployTime check omitted as it's variable
    });
  });
});
