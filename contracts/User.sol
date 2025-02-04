// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title User Contract
 * @notice This contract represents a user profile in the decentralized identity system.
 * It stores the user's public key, an array of certified document types, and links to certificate addresses.
 * Only the contract owner (the user) can update sensitive data.
 */
contract User is Ownable {
    // User's public key for asymmetric encryption
    string public publicKey;

    // Array to store types or identifiers of certified documents
    string[] public certified;

    // Address linked to the user's certificate
    address public certificateAddress;

    /**
     * @notice Initializes the User contract with the owner's address, public key, and certificate address.
     * @param _initialOwner The initial owner of the contract.
     * @param _publicKey The public key associated with the user.
     * @param _certificateAddress The certificate address linked to this user (if any).
     */
    constructor(
        address _initialOwner,
        string memory _publicKey,
        address _certificateAddress
    ) Ownable(_initialOwner) {
        publicKey = _publicKey;
        certificateAddress = _certificateAddress;
    }

    /**
     * @notice Updates the user's public key.
     * @dev Only the contract owner can call this function.
     * @param _newPublicKey The new public key to be set.
     */
    function updateAKey(string memory _newPublicKey) external onlyOwner {
        publicKey = _newPublicKey;
    }

    /**
     * @notice Adds a new certified document type/identifier to the user's record.
     * @dev Only the contract owner can add certifications.
     * @param _certifiedDoc A string representing the certified document type.
     */
    function addCertified(string memory _certifiedDoc) external onlyOwner {
        certified.push(_certifiedDoc);
    }

    /**
     * @notice Retrieves a certified document type by index.
     * @dev Only the contract owner can view individual certified entries.
     * @param index The index of the certified document in the array.
     * @return The certified document type as a string.
     */
    function getCertified(uint index) external view onlyOwner returns (string memory) {
        require(index < certified.length, "Index out of bounds");
        return certified[index];
    }

    /**
     * @notice Updates the certificate address linked to the user.
     * @dev Only the contract owner can update this field.
     * @param _newCertificateAddress The new certificate address.
     */
    function updateCertificateAddress(address _newCertificateAddress) external onlyOwner {
        certificateAddress = _newCertificateAddress;
    }
}
