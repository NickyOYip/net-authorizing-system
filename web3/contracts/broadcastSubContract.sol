// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BroadcastSubContract {
    // Enum for contract status
    enum Status { Active, Disabled }
    
    // State variables
    address public broadcastContractAddr;
    address public owner;
    Status public status;
    uint256 public version;
    string public jsonHash;
    string public softCopyHash;
    string public storageLink;  // Link to Arweave (irys TxID)
    uint256 public startDate;
    uint256 public endDate;
    uint256 public deployTime;
    
    // Events
    event StatusUpdated(address indexed subContractAddr, Status status);
    
    // Constructor
    constructor(
        address _broadcastContractAddr,
        address _owner,
        uint256 _version,
        string memory _jsonHash,
        string memory _softCopyHash,
        string memory _storageLink,
        uint256 _startDate,
        uint256 _endDate
    ) {
        broadcastContractAddr = _broadcastContractAddr;
        owner = _owner;
        status = Status.Active;
        version = _version;
        jsonHash = _jsonHash;
        softCopyHash = _softCopyHash;
        storageLink = _storageLink;
        startDate = _startDate;
        endDate = _endDate;
        deployTime = block.timestamp;
    }
    
    // Modifiers
    modifier onlyOwnerOrParent() {
        require(
            msg.sender == owner || 
            msg.sender == broadcastContractAddr,
            "Only owner or parent contract can perform this action"
        );
        _;
    }
    
    // For Broadcast UserFlow addNewVer 2.5: Used when updating active version
    function updateStatus(uint8 _status) public onlyOwnerOrParent {
        require(_status < 2, "Invalid status");
        status = Status(_status);
        emit StatusUpdated(address(this), status);
    }
    
    // For Broadcast UserFlow verifi 2.1-2.3: Get all details for verification
    function getDetail() public view returns (
        address, address, Status, uint256, string memory, string memory, 
        string memory, uint256, uint256, uint256
    ) {
        return (
            broadcastContractAddr,
            owner,
            status,
            version,
            jsonHash,
            softCopyHash,
            storageLink,
            startDate,
            endDate,
            deployTime
        );
    }
}
