// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Factory {
    // Mapping to store user addresses and their corresponding contract addresses
    mapping(address => address) public userToContract;

    /**
     * @notice Event emitted when a new user is registered.
     * @param user The address of the newly registered user.
     * @param contractAddress The contract address associated with the user.
     * @param timestamp The timestamp when the registration took place.
     */
    event UserRegistered(address indexed user, address contractAddress, uint256 timestamp);

    /**
     * @notice Registers a new user by associating their address with a contract address.
     * @dev Anyone can call this function to add users.
     * @param userAddress The address of the user to register.
     * @param contractAddress The contract address to associate with the user.
     */
    function add(address userAddress, address contractAddress) public {
        // Ensure that the user is not already registered
        require(userToContract[userAddress] == address(0), "User already registered.");

        // Register the user with their contract address
        userToContract[userAddress] = contractAddress;

        // Emit the UserRegistered event with the current timestamp
        emit UserRegistered(userAddress, contractAddress, block.timestamp);
    }

    /**
     * @notice Retrieves the contract address associated with a specific user.
     * @dev This function is publicly viewable and does not modify the blockchain state.
     * @param userAddress The address of the user whose contract address is being queried.
     * @return The contract address associated with the user.
     */
    function find(address userAddress) public view returns (address) {
        address contractAddr = userToContract[userAddress];
        require(contractAddr != address(0), "No such user.");
        return contractAddr;
    }
}
