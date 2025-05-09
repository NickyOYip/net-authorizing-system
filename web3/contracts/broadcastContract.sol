// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./broadcastSubContract.sol";
import "hardhat/console.sol"; // Add console import

contract BroadcastContract {
    // State variables
    address public owner;
    string public title;
    uint256 public totalVerNo;
    mapping(uint256 => address) public versions;
    uint256 public activeVer;
    
    // Events
    event NewBroadcastSubContractOwned(
        address indexed broadcastContractAddr, 
        address indexed subContractAddr, 
        address indexed ownerAddr,
        uint256 startDate,
        uint256 endDate
    );
    
    // Constructor
    constructor(address _owner, string memory _title) {
        owner = _owner;
        title = _title;
        totalVerNo = 0;
        activeVer = 0;
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    // For Broadcast UserFlow createNew 1.4 / addNewVer 2.4-2.5: Creates a new sub-contract and updates version
    function addNewBroadcastSubContract(
        string memory _jsonHash,
        string memory _softCopyHash,
        string memory _storageLink,
        uint256 _startDate,
        uint256 _endDate
    ) public onlyOwner returns (address) {
        console.log("DEBUG: I'm in the function!"); // Debug log without Unicode
        console.log("Caller address:", msg.sender);
        console.log("Owner address:", owner);
        
        // Create new sub-contract
        BroadcastSubContract newSubContract = new BroadcastSubContract(
            address(this),
            owner,
            totalVerNo + 1,
            _jsonHash,
            _softCopyHash,
            _storageLink,
            _startDate,
            _endDate
        );
        
        // Update version mapping and increment version counter
        totalVerNo++;
        versions[totalVerNo] = address(newSubContract);
        
        // If there was a previous active version, disable it
        if (totalVerNo > 1) {
            BroadcastSubContract prevContract = BroadcastSubContract(versions[activeVer]);
            prevContract.updateStatus(1); // 1 = Disabled
        }
        
        // Set the new version as active
        activeVer = totalVerNo;
        
        emit NewBroadcastSubContractOwned(
            address(this),
            address(newSubContract),
            owner,
            _startDate,
            _endDate
        );
        
        return address(newSubContract);
    }
    
    // View functions for accessing sub-contracts
    function getAllBroadcastSubContracts() public view returns (address[] memory) {
        address[] memory allSubContracts = new address[](totalVerNo);
        for (uint256 i = 1; i <= totalVerNo; i++) {
            allSubContracts[i - 1] = versions[i];
        }
        return allSubContracts;
    }
    
    function getBroadcastContractByIndex(uint256 index) public view returns (address) {
        require(index > 0 && index <= totalVerNo, "Invalid version number");
        return versions[index];
    }
    
    // For Broadcast UserFlow verifi 1.2: Get current active version
    function getCurrentVersion() public view returns (address) {
        return versions[activeVer];
    }
}
