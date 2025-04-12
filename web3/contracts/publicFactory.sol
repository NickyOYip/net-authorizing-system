// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./publicContract.sol";

contract PublicFactory {
    // State variables
    address[] public publicContractAddrs;
    
    // Events
    event NewPublicContractOwned(
        address indexed factoryAddr, 
        address indexed contractAddr, 
        address indexed ownerAddr,
        string title
    );
    
    // For Public UserFlow createNew 1.3: Create a public contract
    // Changed to accept raw activation code which will be hashed by the contract
    function createPublicContract(string memory title, string memory activationCode) public returns (address) {
        PublicContract newContract = new PublicContract(msg.sender, title, activationCode);
        publicContractAddrs.push(address(newContract));
        
        emit NewPublicContractOwned(
            address(this),
            address(newContract),
            msg.sender,
            title
        );
        
        return address(newContract);
    }
    
    // View functions for accessing contracts
    function getAllPublicContracts() public view returns (address[] memory) {
        return publicContractAddrs;
    }
    
    function getPublicContractByIndex(uint256 index) public view returns (address) {
        require(index < publicContractAddrs.length, "Index out of bounds");
        return publicContractAddrs[index];
    }
}
