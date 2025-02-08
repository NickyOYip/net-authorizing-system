// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title User Contract
 * @notice This contract represents a user's profile, storing certified certificates and encrypted view codes.
 */
contract User {
    address private owner;

    // Array to store addresses of certified certificates
    address[] private certificatesList;
    mapping(address => bool) private isInCertificatesList; // Track existence

    // Array to store addresses of certified certificates
    address[] private certifiedCertificates;
    mapping(address => bool) private isInCertifiedList; // Track existence


    /**
     * @notice Modifier to restrict functions to the contract owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "[User][AddressErr]:Not the contract owner.");
        _;
    }
    
    /**
     * @notice Initializes the User contract and sets the contract owner.
     */
    constructor() {
        owner = msg.sender;
    }
    /**
     * @notice Adds a certificate to the general list.
     * @param _certificate The address of the certificate to add.
     * @dev Reverts if the certificate already exists.
     */
    function addCertificate(address _certificate) external {
        require(!isInCertificatesList[_certificate], "[User][AddressErr]:Certificate already exists");
        certificatesList.push(_certificate);
        isInCertificatesList[_certificate] = true;
    }

    /**
     * @notice Adds a certificate to the certified list.
     * @param _certificate The address of the certificate to certify.
     * @dev Reverts if the certificate is already certified.
     */
    function addCertifiedCertificate(address _certificate) external {
        require(!isInCertifiedList[_certificate], "[User][AddressErr]:Certificate already exists");
        certifiedCertificates.push(_certificate);
        isInCertifiedList[_certificate] = true;
    }

    /**
     * @notice Gets all stored certificates.
     * @return certificates An array of certificate addresses.
     * @dev Output example: ["0x123...", "0x456...", "0x789..."]
     */
    function getCertificates() external view returns (address[] memory certificates) {
        return certificatesList;
    }

    /*
     * @notice Gets all certified certificates.
     * @return certifiedCerts An array of certified certificate addresses.
     * @dev Output example: ["0xabc...", "0xdef...", "0xghi..."]
     */
    function getCertifiedCertificates() external view returns (address[] memory certifiedCerts) {
        return certifiedCertificates;
    }

}
