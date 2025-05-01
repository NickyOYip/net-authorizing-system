const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PublicFactory Contract", function () {
  let PublicFactory;
  let publicFactory;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the contract factories
    PublicFactory = await ethers.getContractFactory("PublicFactory");
    
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy the contract
    publicFactory = await PublicFactory.deploy();
  });

  describe("Contract Creation", function () {
    it("Should create a new public contract", async function () {
      const title = "Test Certificate";
      const activationCode = "secret123"; // Plain text activation code
      
      // Get contract count before
      const contractsBefore = await publicFactory.getAllPublicContracts();
      
      // Create contract
      await publicFactory.createPublicContract(title, activationCode);
      
      // Get contract count after
      const contractsAfter = await publicFactory.getAllPublicContracts();
      
      // Verify a contract was added
      expect(contractsAfter.length).to.equal(contractsBefore.length + 1);
      
      // Get the new contract address
      const newContractAddr = contractsAfter[contractsAfter.length - 1];
      
      // Verify it's a valid address (not zero address)
      expect(newContractAddr).to.not.equal("0x0000000000000000000000000000000000000000");
      
      // Verify contract properties if needed
      const PublicContract = await ethers.getContractFactory("PublicContract");
      const newContract = PublicContract.attach(newContractAddr);
      
      expect(await newContract.owner()).to.equal(owner.address);
      expect(await newContract.title()).to.equal(title);
    });
    
    it("Should emit NewPublicContractOwned event when creating contract", async function () {
      const title = "Event Test Certificate";
      const activationCode = "secret123";
      
      await expect(publicFactory.createPublicContract(title, activationCode))
        .to.emit(publicFactory, "NewPublicContractOwned")
        .withArgs(
          ethers.anyValue,
          ethers.anyValue,
          owner.address,
          title
        );
    });
  });

  describe("Contract Retrieval", function () {
    beforeEach(async function () {
      // Create a contract first
      await publicFactory.createPublicContract("Test Certificate", "secret123");
    });
    
    it("Should get all public contracts", async function () {
      const contracts = await publicFactory.getAllPublicContracts();
      expect(contracts.length).to.equal(1);
    });
    
    it("Should get public contract by index", async function () {
      const contracts = await publicFactory.getAllPublicContracts();
      const contractByIndex = await publicFactory.getPublicContractByIndex(0);
      expect(contractByIndex).to.equal(contracts[0]);
    });
    
    it("Should fail when trying to get contract with out-of-bounds index", async function () {
      await expect(
        publicFactory.getPublicContractByIndex(5)
      ).to.be.revertedWith("Index out of bounds");
    });
  });

  describe("Multiple Contracts", function () {
    it("Should create and track multiple contracts", async function () {
      await publicFactory.createPublicContract("Certificate 1", "secret123");
      await publicFactory.createPublicContract("Certificate 2", "secret456");
      await publicFactory.createPublicContract("Certificate 3", "secret789");
      
      const contracts = await publicFactory.getAllPublicContracts();
      expect(contracts.length).to.equal(3);
    });
  });
});
