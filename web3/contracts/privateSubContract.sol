// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PrivateSubContract {
    // Enum for contract status
    enum Status { Active, Disabled }
    
    // State variables
    address public privateContractAddr;
    address public owner;
    address public parent;
    address public user;  // Will be updated when user activates the parent contract
    Status public status;
    uint256 public version;
    string public jsonHash;
    string public softCopyHash;
    string public jsonLink;    // Will be null until user uploads encrypted data
    string public softCopyLink;  // Will be null until user uploads encrypted data
    uint256 public startDate;
    uint256 public endDate;
    uint256 public deployTime;
    
    // Events
    event StatusUpdated(address indexed subContractAddr, Status status);
    event DataLinksUpdated(address indexed subContractAddr, address indexed userAddr);
    
    // Constructor
    constructor(
        address _privateContractAddr,
        address _owner,
        address _user,
        uint256 _version,
        string memory _jsonHash,
        string memory _softCopyHash,
        uint256 _startDate,
        uint256 _endDate
    ) {
        privateContractAddr = _privateContractAddr;
        parent = _privateContractAddr;
        owner = _owner;
        user = _user;
        status = Status.Active;
        version = _version;
        jsonHash = _jsonHash;
        softCopyHash = _softCopyHash;
        startDate = _startDate;
        endDate = _endDate;
        deployTime = block.timestamp;
    }
    
    // Modifiers
    modifier onlyOwnerOrParent() {
        require(
            msg.sender == owner || 
            msg.sender == privateContractAddr,
            "Only owner or parent contract can perform this action"
        );
        _;
    }
    
    modifier onlyUser() {
        require(msg.sender == user, "Only user can perform this action");
        _;
    }
    
    // For Private UserFlow addNewVer 2.5: Used when updating active version
    function updateStatus(uint8 _status) public onlyOwnerOrParent {
        require(_status < 2, "Invalid status");
        status = Status(_status);
        emit StatusUpdated(address(this), status);
    }
    
    // For Private UserFlow createNew 3.2: Set user when contract is activated
    function setUser(address _user) public onlyOwnerOrParent {
        user = _user;
    }
    
    // For Private UserFlow createNew 3.3-3.5 / addNewVer 4.2-4.4: User uploads encrypted data links
    function updateDataLinks(string memory _jsonLink, string memory _softCopyLink) public onlyUser {
        jsonLink = _jsonLink;
        softCopyLink = _softCopyLink;
        emit DataLinksUpdated(address(this), user);
    }
    
    // For Private UserFlow verifi 2.2-3.3: Get all details for verification
    function getDetail() public view returns (
        address, address, address, address, Status, uint256, string memory, string memory,
        string memory, string memory, uint256, uint256, uint256
    ) {
        return (
            privateContractAddr,
            owner,
            parent,
            user,
            status,
            version,
            jsonHash,
            softCopyHash,
            jsonLink,
            softCopyLink,
            startDate,
            endDate,
            deployTime
        );
    }
}
