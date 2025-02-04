// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Migrations
 * @dev This contract is used to track the progress of deployment migrations.
 *      It helps prevent the same migration scripts from being run multiple times.
 */
contract Migrations {
    // The owner of this contract (typically the deployer)
    address public owner;

    // Tracks the last completed migration script number
    uint public lastCompletedMigration;

    // Modifier to restrict functions to only be callable by the owner.
    modifier restricted() {
        require(msg.sender == owner, "This function is restricted to the contract's owner");
        _;
    }

    /**
     * @dev Constructor sets the owner to the address that deployed the contract.
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Updates the last completed migration number.
     *      This function can only be called by the owner.
     * @param completed The migration number that was completed.
     */
    function setCompleted(uint completed) public restricted {
        lastCompletedMigration = completed;
    }

    /**
     * @dev This function allows upgrading the Migrations contract itself,
     *      transferring the migration state to a new contract.
     *      It calls setCompleted on the new contract, ensuring continuity.
     *      Only the owner can perform an upgrade.
     * @param newAddress The address of the new Migrations contract.
     */
    function upgrade(address newAddress) public restricted {
        Migrations upgraded = Migrations(newAddress);
        upgraded.setCompleted(lastCompletedMigration);
    }
}
