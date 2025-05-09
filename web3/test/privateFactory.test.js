const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivateFactory Contract", function () {
  let PrivateFactory;
  let privateFactory;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the contract factories
    PrivateFactory = await ethers.getContractFactory("PrivateFactory");
    
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy the contract
    privateFactory = await PrivateFactory.deploy();
  });

  describe("Contract Creation", function () {
    it("Should create a new private contract", async function () {
      const title = "Test Certificate";
      const activationCode = "secret123"; // Plain text activation code
      
      // Get contract count before
      const contractsBefore = await privateFactory.getAllPrivateContracts();
      
      // Create contract
      await privateFactory.createPrivateContract(title, activationCode);
      
      // Get contract count after
      const contractsAfter = await privateFactory.getAllPrivateContracts();
      
      // Verify a contract was added
      expect(contractsAfter.length).to.equal(contractsBefore.length + 1);
      
      // Get the new contract address
      const newContractAddr = contractsAfter[contractsAfter.length - 1];
      
      // Verify it's a valid address (not zero address)
      expect(newContractAddr).to.not.equal("0x0000000000000000000000000000000000000000");
      
      // Verify contract properties if needed
      const PrivateContract = await ethers.getContractFactory("PrivateContract");
      const newContract = PrivateContract.attach(newContractAddr);
      
      expect(await newContract.owner()).to.equal(owner.address);
      expect(await newContract.title()).to.equal(title);
    });

    it("Should emit NewPrivateContractOwned event when creating contract", async function () {
      const title = "Event Test Certificate";
      const activationCode = "secret123";
      
      await expect(privateFactory.createPrivateContract(title, activationCode))
        .to.emit(privateFactory, "NewPrivateContractOwned")
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
      await privateFactory.createPrivateContract("Test Certificate", "secret123");
    });
    
    it("Should get all private contracts", async function () {
      const contracts = await privateFactory.getAllPrivateContracts();
      expect(contracts.length).to.equal(1);
    });
    
    it("Should get private contract by index", async function () {
      const contracts = await privateFactory.getAllPrivateContracts();
      const contractByIndex = await privateFactory.getPrivateContractByIndex(0);
      expect(contractByIndex).to.equal(contracts[0]);
    });
    
    it("Should fail when trying to get contract with out-of-bounds index", async function () {
      await expect(
        privateFactory.getPrivateContractByIndex(5)
      ).to.be.revertedWith("Index out of bounds");
    });
  });

  describe("Multiple Contracts", function () {
    it("Should create and track multiple contracts", async function () {
      await privateFactory.createPrivateContract("Certificate 1", "secret123");
      await privateFactory.createPrivateContract("Certificate 2", "secret456");
      await privateFactory.createPrivateContract("Certificate 3", "secret789");
      
      const contracts = await privateFactory.getAllPrivateContracts();
      expect(contracts.length).to.equal(3);
    });
  });
});
