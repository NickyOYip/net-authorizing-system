// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./privateContract.sol";

contract PrivateFactory {
    // State variables
    address[] public privateContractAddrs;
    
    // Events
    event NewPrivateContractOwned(
        address indexed factoryAddr, 
        address indexed contractAddr, 
        address indexed ownerAddr,
        string title
    );
    
    // For Private UserFlow createNew 1.2: Create a private contract
    // Changed to accept raw activation code which will be hashed by the contract
    function createPrivateContract(string memory title, string memory activationCode) public returns (address) {
        PrivateContract newContract = new PrivateContract(msg.sender, title, activationCode);
        privateContractAddrs.push(address(newContract));
        
        emit NewPrivateContractOwned(
            address(this),
            address(newContract),
            msg.sender,
            title
        );
        
        return address(newContract);
    }
    
    // View functions for accessing contracts
    function getAllPrivateContracts() public view returns (address[] memory) {
        return privateContractAddrs;
    }
    
    function getPrivateContractByIndex(uint256 index) public view returns (address) {
        require(index < privateContractAddrs.length, "Index out of bounds");
        return privateContractAddrs[index];
    }
}
