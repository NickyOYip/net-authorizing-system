// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./privateSubContract.sol";

contract PrivateContract {
    // State variables
    address public owner;
    address public user;  // Null until activated by user
    string public title;
    uint256 public totalVerNo;
    mapping(uint256 => address) public versions;
    uint256 public activeVer;
    bytes32 public activationCodeHash; // Changed to bytes32 for keccak256 hash
    
    // Events
    event NewPrivateSubContractOwned(
        address indexed privateContractAddr, 
        address indexed subContractAddr, 
        address indexed ownerAddr,
        uint256 startDate,
        uint256 endDate
    );
    
    event PrivateContractActivated(
        address indexed privateContractAddr, 
        address indexed ownerAddr, 
        address indexed userAddr,
        string title
    );
    
    // Constructor now accepts raw activation code and computes the hash
    constructor(address _owner, string memory _title, string memory _activationCode) {
        owner = _owner;
        title = _title;
        totalVerNo = 0;
        activeVer = 0;
        // Hash the activation code on contract creation
        activationCodeHash = keccak256(abi.encodePacked(_activationCode));
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    // For Private UserFlow createNew 1.4 / addNewVer 1.2: Creates a new sub-contract and updates version
    function addNewPrivateSubContract(
        string memory _jsonHash,
        string memory _softCopyHash,
        uint256 _startDate,
        uint256 _endDate
    ) public onlyOwner returns (address) {
        // Create new sub-contract
        PrivateSubContract newSubContract = new PrivateSubContract(
            address(this),
            owner,
            user,  // Will be address(0) if not activated yet
            totalVerNo + 1,
            _jsonHash,
            _softCopyHash,
            _startDate,
            _endDate
        );
        
        // Update version mapping and increment version counter
        totalVerNo++;
        versions[totalVerNo] = address(newSubContract);
        
        // If there was a previous active version, disable it
        if (totalVerNo > 1) {
            PrivateSubContract prevContract = PrivateSubContract(versions[activeVer]);
            prevContract.updateStatus(1); // 1 = Disabled
        }
        
        // Set the new version as active
        activeVer = totalVerNo;
        
        emit NewPrivateSubContractOwned(
            address(this),
            address(newSubContract),
            owner,
            _startDate,
            _endDate
        );
        
        return address(newSubContract);
    }
    
    // For Private UserFlow createNew 3.1-3.2: Activates the contract for a specific user
    // Updated to hash the provided activation code before comparing
    function activate(string memory activationCode) public {
        require(user == address(0), "Contract already activated");
        
        // Hash the provided activation code and compare with stored hash
        require(keccak256(abi.encodePacked(activationCode)) == activationCodeHash, 
                "Invalid activation code");
        
        user = msg.sender;
        
        emit PrivateContractActivated(
            address(this),
            owner,
            user,
            title
        );
        
        // Update user address in all sub-contracts
        for (uint256 i = 1; i <= totalVerNo; i++) {
            PrivateSubContract subContract = PrivateSubContract(versions[i]);
            subContract.setUser(user);
        }
    }
    
    // View functions for accessing sub-contracts
    function getAllPrivateSubContracts() public view returns (address[] memory) {
        address[] memory allSubContracts = new address[](totalVerNo);
        for (uint256 i = 1; i <= totalVerNo; i++) {
            allSubContracts[i - 1] = versions[i];
        }
        return allSubContracts;
    }
    
    function getPrivateContractByIndex(uint256 index) public view returns (address) {
        require(index > 0 && index <= totalVerNo, "Invalid version number");
        return versions[index];
    }
    
    // For Private UserFlow verifi 2.2: Get current active version
    function getCurrentVersion() public view returns (address) {
        return versions[activeVer];
    }
}
