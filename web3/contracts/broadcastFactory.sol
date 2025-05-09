// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./broadcastContract.sol";

contract BroadcastFactory {
    // State variables
    address[] public broadcastContractAddrs;
    
    // Events
    event NewBroadcastContractOwned(
        address indexed factoryAddr, 
        address indexed contractAddr, 
        address indexed ownerAddr,
        string title
    );
    
    // For Broadcast UserFlow createNew 1.3: Create a broadcast contract
    function createBroadcastContract(string memory title) public returns (address) {
        BroadcastContract newContract = new BroadcastContract(msg.sender, title);
        broadcastContractAddrs.push(address(newContract));
        
        emit NewBroadcastContractOwned(
            address(this),
            address(newContract),
            msg.sender,
            title
        );
        
        return address(newContract);
    }
    
    // View functions for accessing contracts
    function getAllBroadcastContracts() public view returns (address[] memory) {
        return broadcastContractAddrs;
    }
    
    function getBroadcastContractByIndex(uint256 index) public view returns (address) {
        require(index < broadcastContractAddrs.length, "Index out of bounds");
        return broadcastContractAddrs[index];
    }
}
