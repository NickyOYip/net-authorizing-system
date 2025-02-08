// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title Certificate Contract
 * @notice This contract manages certificate data, state transitions, and activation processes.
 */
contract Certificate {
    address private owner;
    address public userAddress;

    // Certificate data encrypted with user's view code
    string private data;

    // Hash of the certified document
    string public documentHash;
    string public jsonHash;

    // Activation details
    string private activeCode;
    uint256 public activeTime;
    uint256 public disableTime;
    uint256 public deployTime;

    // Enum to represent the current state of the certificate.
    enum State { Inactive, Active, Disabled }
    State public state;

    // Events
    event CertificateActivated(address indexed user, uint256 timestamp);
    event StateUpdated(State newState, uint256 disableTime);

    /**
     * @notice Modifier to restrict functions to the contract owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "[Certificate][AddressErr]:Not the contract owner.");
        _;
    }

    /**
     * @notice Modifier to allow only the linked user to access specific functions.
     */
    modifier onlyUser() {
        require(msg.sender == userAddress, "[Certificate][AddressErr]:Not the linked user.");
        _;
    }

    /**
     * @notice Modifier to allow only the specific State to access specific functions.
     */
    function stateToString(State _state) internal pure returns (string memory) {
        if (_state == State.Inactive) return "Inactive";
        if (_state == State.Active) return "Active";
        if (_state == State.Disabled) return "Disabled";
        return "Unknown";
    }

    modifier checkState(State stateToCheck) {
        require(state == stateToCheck, string(abi.encodePacked("[Certificate][StateErr]:Contract is ", stateToString(state), ".")));
        _;
    }



    /**
     * @notice Initializes the Certificate contract with an owner and activation code.
     * @param _activeCode The activation code for the certificate.
     * @param _documentHash The hash of the certified document.
     * @param _jsonHash The hash of the VP(Data).
     * @param _disableTime The time limit for the certificate to be disabled.
     */
    constructor(string memory _activeCode, string memory _documentHash, string memory  _jsonHash, uint256 _disableTime) {
        owner = msg.sender;
        activeCode = _activeCode;
        activeTime = block.timestamp + 1 days; // Default time limit: 1 day
        documentHash = _documentHash;
        jsonHash = _jsonHash;
        state = State.Inactive;
        deployTime = block.timestamp;
        disableTime = deployTime + (_disableTime * 1 days);
    }

    /**
     * @notice Activates the certificate if within the activation time limit.
     * @param _userAddress The address of the user activating the certificate.
     * @param _activeCode The activation code provided by the user.
     */
    function activateCertificate(address _userAddress, string memory _activeCode, string memory _data) external checkState(State.Inactive){
        require(block.timestamp <= activeTime, "[Certificate][TimeErr]:Activation time expired.");
        require(keccak256(abi.encodePacked(activeCode)) == keccak256(abi.encodePacked(_activeCode)), "[Certificate][CodeErr]:Invalid activation code.");
        userAddress = _userAddress;
        state = State.Active;
        data = _data;
        emit CertificateActivated(_userAddress, block.timestamp);
    }

    /**
     * @notice Updates the certificate's state and sets a disable time if needed.
     * @param _newState Indicates the state of the certificate.
     * @param _disableTime The timestamp when the certificate should be disabled .
     */
    function updateState(State _newState, uint256 _disableTime) external onlyOwner {
        disableTime = deployTime + (_disableTime * 1 days);
        state = _newState;
    }

    /**
     * @notice Retrieves the certificate data and document hash.
     * @return The encrypted data, document hash, VPHash, state.
     */
    function getCertificate() external view returns (string memory, string memory, string memory, State, uint256) {
        return (data, documentHash, jsonHash, state, disableTime);
    }


}
