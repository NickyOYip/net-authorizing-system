// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Migrations {
    address public owner;
    uint public last_completed_migration;

    event OwnerSet(address indexed owner);
    event Log(string message);

    constructor() {
        owner = msg.sender;
        emit OwnerSet(owner);
        // Commented out extra log event to check deployment:
        // emit Log("Constructor executed");
    }

    modifier restricted() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function setCompleted(uint completed) public restricted {
        last_completed_migration = completed;
    }
}
