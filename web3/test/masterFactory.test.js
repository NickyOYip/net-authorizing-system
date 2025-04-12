const { expect } = require("chai");
const { ethers } = require("hardhat");

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
