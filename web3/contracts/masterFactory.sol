// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MasterFactory {
    // State variables
    address[] public broadcastFactoryAddrs;
    uint256 public broadcastFactoryCurrentVer;
    
    address[] public publicFactoryAddrs;
    uint256 public publicFactoryCurrentVer;
    
    address[] public privateFactoryAddrs;
    uint256 public privateFactoryCurrentVer;
    
    address public owner;
    
    // Events
    event NewVerContractPushed(string factoryName, uint256 verNo, address indexed masterFactoryAddr, address indexed subFactoryAddr, address indexed ownerAddr);
    event UsingVer(string factoryName, uint256 verNo, address indexed masterFactoryAddr, address indexed subFactoryAddr, address indexed ownerAddr);
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    // For UserFlow pre-step 1: Frontend uses this contract to find current factories
    function getCurrentVer() public view returns (address, address, address) {
        return (
            broadcastFactoryAddrs[broadcastFactoryCurrentVer],
            publicFactoryAddrs[publicFactoryCurrentVer],
            privateFactoryAddrs[privateFactoryCurrentVer]
        );
    }
    
    // For development: Adding new factory versions
    function addBroadcastFactoryVer(address newFactory) public onlyOwner {
        broadcastFactoryAddrs.push(newFactory);
        emit NewVerContractPushed("BroadcastFactory", broadcastFactoryAddrs.length - 1, address(this), newFactory, owner);
    }
    
    function addPublicFactoryVer(address newFactory) public onlyOwner {
        publicFactoryAddrs.push(newFactory);
        emit NewVerContractPushed("PublicFactory", publicFactoryAddrs.length - 1, address(this), newFactory, owner);
    }
    
    function addPrivateFactoryVer(address newFactory) public onlyOwner {
        privateFactoryAddrs.push(newFactory);
        emit NewVerContractPushed("PrivateFactory", privateFactoryAddrs.length - 1, address(this), newFactory, owner);
    }
    
    // For development: Updating current factory versions
    function updateBroadcastFactoryVer(uint256 verNo) public onlyOwner {
        require(verNo < broadcastFactoryAddrs.length, "Version does not exist");
        broadcastFactoryCurrentVer = verNo;
        emit UsingVer("BroadcastFactory", verNo, address(this), broadcastFactoryAddrs[verNo], owner);
    }
    
    function updatePublicFactoryVer(uint256 verNo) public onlyOwner {
        require(verNo < publicFactoryAddrs.length, "Version does not exist");
        publicFactoryCurrentVer = verNo;
        emit UsingVer("PublicFactory", verNo, address(this), publicFactoryAddrs[verNo], owner);
    }
    
    function updatePrivateFactoryVer(uint256 verNo) public onlyOwner {
        require(verNo < privateFactoryAddrs.length, "Version does not exist");
        privateFactoryCurrentVer = verNo;
        emit UsingVer("PrivateFactory", verNo, address(this), privateFactoryAddrs[verNo], owner);
    }
    
    // For getting all versions of factories
    function getAllVer() public view returns (address[] memory, address[] memory, address[] memory) {
        return (broadcastFactoryAddrs, publicFactoryAddrs, privateFactoryAddrs);
    }
}
