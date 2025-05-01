const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PublicSubContract", function () {
  let PublicSubContract;
  let publicSubContract;
  let parentContractAddr;
  let owner;
  let user;
  let addr1;
  
  const version = 1;
  const jsonHash = "0x123abc";
  const softCopyHash = "0x456def";
  const storageLink = "ar://txid123";
  const startDate = Math.floor(Date.now() / 1000);
  const endDate = startDate + 31536000; // +1 year

  beforeEach(async function () {
    // Get contract factories
    PublicSubContract = await ethers.getContractFactory("PublicSubContract");
    
    // Get signers
    [owner, user, addr1] = await ethers.getSigners();
    
    // Use addr1 as the mock parent contract address
    parentContractAddr = addr1.address;
    
    // Initially user is zero address (not activated)
    const initialUser = ethers.ZeroAddress;
    
    // Deploy the contract
    publicSubContract = await PublicSubContract.deploy(
      parentContractAddr,
      owner.address,
      initialUser,
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
      expect(await publicSubContract.publicContractAddr()).to.equal(parentContractAddr);
      expect(await publicSubContract.parent()).to.equal(parentContractAddr);
      expect(await publicSubContract.owner()).to.equal(owner.address);
      expect(await publicSubContract.user()).to.equal(ethers.ZeroAddress);
      expect(await publicSubContract.status()).to.equal(0); // Active
      expect(await publicSubContract.version()).to.equal(version);
      expect(await publicSubContract.jsonHash()).to.equal(jsonHash);
      expect(await publicSubContract.softCopyHash()).to.equal(softCopyHash);
      expect(await publicSubContract.storageLink()).to.equal(storageLink);
      expect(await publicSubContract.startDate()).to.equal(startDate);
      expect(await publicSubContract.endDate()).to.equal(endDate);
      
      const deployTime = await publicSubContract.deployTime();
      expect(deployTime).to.be.closeTo(
        BigInt(Math.floor(Date.now() / 1000)),
        60n // Allow 60 seconds tolerance
      );
    });
  });

  describe("Status Update", function () {
    it("Should allow owner to update status", async function () {
      await publicSubContract.updateStatus(1); // Disabled
      expect(await publicSubContract.status()).to.equal(1);
    });
    
    it("Should allow parent contract to update status", async function () {
      await publicSubContract.connect(addr1).updateStatus(1); // Disabled
      expect(await publicSubContract.status()).to.equal(1);
    });
    
    it("Should fail when non-owner/non-parent tries to update status", async function () {
      await expect(
        publicSubContract.connect(user).updateStatus(1)
      ).to.be.revertedWith("Only owner or parent contract can perform this action");
    });
    
    it("Should fail with invalid status value", async function () {
      await expect(
        publicSubContract.updateStatus(2)
      ).to.be.revertedWith("Invalid status");
    });

    it("Should emit StatusUpdated event when status is updated", async function () {
      await expect(publicSubContract.updateStatus(1))
        .to.emit(publicSubContract, "StatusUpdated")
        .withArgs(ethers.anyValue, 1);
    });
  });

  describe("User Management", function () {
    it("Should allow parent to set user", async function () {
      await publicSubContract.connect(addr1).setUser(user.address);
      expect(await publicSubContract.user()).to.equal(user.address);
    });
    
    it("Should allow owner to set user", async function () {
      await publicSubContract.setUser(user.address);
      expect(await publicSubContract.user()).to.equal(user.address);
    });
    
    it("Should fail when non-owner/non-parent tries to set user", async function () {
      await expect(
        publicSubContract.connect(user).setUser(user.address)
      ).to.be.revertedWith("Only owner or parent contract can perform this action");
    });
  });

  describe("Data Retrieval", function () {
    it("Should get all contract details", async function () {
      const details = await publicSubContract.getDetail();
      
      expect(details[0]).to.equal(parentContractAddr); // publicContractAddr
      expect(details[1]).to.equal(owner.address); // owner
      expect(details[2]).to.equal(parentContractAddr); // parent
      expect(details[3]).to.equal(ethers.ZeroAddress); // user (not set yet)
      expect(details[4]).to.equal(0); // status (Active)
      expect(details[5]).to.equal(version); // version
      expect(details[6]).to.equal(jsonHash); // jsonHash
      expect(details[7]).to.equal(softCopyHash); // softCopyHash
      expect(details[8]).to.equal(storageLink); // storageLink
      expect(details[9]).to.equal(startDate); // startDate
      expect(details[10]).to.equal(endDate); // endDate
      // deployTime check omitted as it's variable
    });
  });
});
