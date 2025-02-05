// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Certificate Contract
 * @notice Manages digital certificates with secure activation, state control, and encrypted data handling.
 */
contract Certificate is Ownable {
    address public userAddress;             // Address linked to this certificate.
    string private data;                    // Encrypted certificate data.
    bytes32 public hash;                    // Hash of the certified document for integrity.
    string private activeCode;             // Activation code for certificate activation.
    uint256 public activeTimeLimit = 1 days; // Time limit for activation (default 1 day).
    address public certificateAddress;     // Associated certificate contract address.

    enum State { Inactive, Active, Disabled }
    State public state;

    uint256 public disableTime;            // Timestamp when the certificate will auto-disable.

    // Events
    event CertificateActivated(address indexed user, uint256 timestamp);
    event StateUpdated(State newState, uint256 disableTime);
    event DataUpdated(string newData);

    /**
     * @notice Constructor to initialize the certificate.
     * @param _initialOwner The contract owner.
     * @param _activeCode The activation code for this certificate.
     * @param _certificateAddress The address of the related certificate contract.
     * @param _hash The hash of the certified document.
     */
    constructor(
        address _initialOwner,
        string memory _activeCode,
        address _certificateAddress,
        bytes32 _hash
    ) Ownable(_initialOwner) {
        activeCode = _activeCode;
        certificateAddress = _certificateAddress;
        hash = _hash;
        state = State.Inactive;
    }

    /**
     * @notice Activates the certificate if within time limit and valid activation code is provided.
     * @param _userAddress The address of the user activating the certificate.
     * @param _activeCode The activation code provided by the user.
     */
    function activateCertificate(address _userAddress, string memory _activeCode) external {
        require(state == State.Inactive, "Certificate already active or disabled.");
        require(block.timestamp <= activeTimeLimit, "Activation time expired.");
        require(keccak256(abi.encodePacked(activeCode)) == keccak256(abi.encodePacked(_activeCode)), "Invalid activation code.");

        userAddress = _userAddress;
        state = State.Active;
        emit CertificateActivated(_userAddress, block.timestamp);
    }

    /**
     * @notice Updates the certificate's state.
     * @param _newState The new state to be set (Inactive, Active, Disabled).
     * @param _disableTime The timestamp when the certificate should auto-disable.
     */
    function updateState(State _newState, uint256 _disableTime) external onlyOwner {
        state = _newState;
        disableTime = _disableTime;
        emit StateUpdated(_newState, _disableTime);
    }

    /**
     * @notice Retrieves the certificate data and its hash if active.
     * @return The encrypted certificate data and document hash.
     */
    function getCertificate() external view returns (string memory, bytes32) {
        require(state == State.Active, "Certificate is not active.");
        return (data, hash);
    }

    /**
     * @notice Updates the certificate data after re-encryption with a new view code.
     * @param _newData The new encrypted certificate data.
     */
    function updateData(string memory _newData) external {
        require(msg.sender == userAddress, "Unauthorized: Only the user can update data.");
        data = _newData;
        emit DataUpdated(_newData);
    }
}
