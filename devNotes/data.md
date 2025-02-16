# Data Store Structure

## Overview

This document outlines the high-level design of the data store structure for the DApp, detailing how user profiles, certificates, and their states are managed.

# Centralized Data Store Structure

## Overview

This document outlines the high-level design of the centralized data store structure for the DApp. The centralized data store will save data fetched from the smart contracts and provide a unified state management solution for the frontend application.

## Data Store Components

### Global State

- **Purpose**: Store global state variables such as the user's account, network, and other application-wide data.
- **Structure**:
  - `account`: The user's Ethereum account address.
  - `network`: The name of the connected Ethereum network.
  - `userProfile`: Object containing user-specific data fetched from the `User` contract.
  - `factoryAddress`: The constant address of the `Factory` contract.
  - `expectedNetwork`: The constant name of the expected Ethereum network.

## Data Models

### History

- **Purpose**: Represents the history of events related to user profiles and certificates.
- **Structure**:
  - `event`: Name of the event (e.g., `UserRegistered`, `CertificateActivated`, `StateUpdated`).
  - `timestamp`: Timestamp of the event.
  - `details`: Additional details about the event.

### UserProfile

- **Purpose**: Represents the user profile data fetched from the `User` contract.
- **Structure**:
  - `owner`: Address of the user.
  - `certificatesList`: Array of `Certificate` objects representing all certificates associated with the user.
  - `certifiedCertificates`: Array of `Certificate` objects representing certified certificates.
  - `history`: Array of `History` objects representing the history of events related to the user profile.
- **Methods to Fetch Data**:
  - `getCertificates()`: Fetches all stored certificates.
    - **Returns**: `address[]` - An array of certificate addresses.
  - `getCertifiedCertificates()`: Fetches all certified certificates.
    - **Returns**: `address[]` - An array of certified certificate addresses.

### Certificate

- **Purpose**: Represents the certificate data fetched from the `Certificate` contract.
- **Structure**:
  - `owner`: Address of the contract owner.
  - `userAddress`: Address of the user linked to the certificate.
  - `data`: Encrypted certificate data.
  - `documentHash`: Hash of the certified document.
  - `jsonHash`: Hash of the JSON certificate.
  - `certificateName`: Name of the certificate.
  - `orgName`: Name of the issuing organization.
  - `activeCode`: Activation code for the certificate.
  - `activeTime`: Timestamp indicating the activation time limit.
  - `disableTime`: Timestamp indicating when the certificate should be disabled.
  - `deployTime`: Timestamp indicating when the certificate was deployed.
  - `state`: Enum representing the current state of the certificate (Inactive, Active, Disabled).
  - `history`: Array of `History` objects representing the history of events related to the certificate.
- **Methods to Fetch Data**:
  - `getCertificate()`: Fetches the certificate data along with other details.
    - **Returns**: 
      - `string` - Encrypted data.
      - `string` - Document hash.
      - `string` - JSON hash.
      - `State` - Current state of the certificate.
      - `uint256` - Deploy time.
      - `uint256` - Disable time.
      - `string` - Certificate name.
      - `string` - Organization name.
      - `address` - Owner address.
- **Events**:
  - `CertificateActivated(address indexed user, uint256 timestamp)`: Emitted when a certificate is activated.
  - `StateUpdated(State newState, uint256 disableTime, uint256 timestamp)`: Emitted when the state of a certificate is updated.

### User.sol

- **Purpose**: Store user-specific data, including certified certificates and encrypted view codes.
- **Structure**:
  - `owner`: Address of the user.
  - `certificatesList`: Array of addresses representing all certificates associated with the user.
  - `certifiedCertificates`: Array of addresses representing certified certificates.
- **Methods to Fetch Data**:
  - `getCertificates()`: Fetches all stored certificates.
    - **Returns**: `address[]` - An array of certificate addresses.
  - `getCertifiedCertificates()`: Fetches all certified certificates.
    - **Returns**: `address[]` - An array of certified certificate addresses.

### Certificate.sol

- **Purpose**: Manage certificate data, state transitions, and activation processes.
- **Structure**:
  - `owner`: Address of the contract owner.
  - `userAddress`: Address of the user linked to the certificate.
  - `data`: Encrypted certificate data.
  - `documentHash`: Hash of the certified document.
  - `jsonHash`: Hash of the JSON certificate.
  - `certificateName`: Name of the certificate.
  - `orgName`: Name of the issuing organization.
  - `activeCode`: Activation code for the certificate.
  - `activeTime`: Timestamp indicating the activation time limit.
  - `disableTime`: Timestamp indicating when the certificate should be disabled.
  - `deployTime`: Timestamp indicating when the certificate was deployed.
  - `state`: Enum representing the current state of the certificate (Inactive, Active, Disabled).
- **Methods to Fetch Data**:
  - `getCertificate()`: Fetches the certificate data along with other details.
    - **Returns**: 
      - `string` - Encrypted data.
      - `string` - Document hash.
      - `string` - JSON hash.
      - `State` - Current state of the certificate.
      - `uint256` - Deploy time.
      - `uint256` - Disable time.
      - `string` - Certificate name.
      - `string` - Organization name.
      - `address` - Owner address.
- **Events**:
  - `CertificateActivated(address indexed user, uint256 timestamp)`: Emitted when a certificate is activated.
  - `StateUpdated(State newState, uint256 disableTime, uint256 timestamp)`: Emitted when the state of a certificate is updated.

### Factory.sol

- **Purpose**: Register users and associate them with contract addresses.
- **Structure**:
  - `userToContract`: Mapping of user addresses to their corresponding contract addresses.
- **Methods to Fetch Data**:
  - `find(address userAddress)`: Retrieves the contract address associated with a specific user.
    - **Returns**: `address` - The contract address associated with the user.
- **Events**:
  - `UserRegistered(address indexed user, address contractAddress, uint256 timestamp)`: Emitted when a new user is registered.

## Data Flow

### User Registration

1. A user registers by calling the `add` function of the `Factory` contract.
2. The user's address is associated with a contract address and stored in the `userToContract` mapping.
3. The `UserRegistered` event is emitted.

### Certificate Management

1. **Adding Certificates**:
   - Users can add certificates to their profile by calling the `addCertificate` or `addCertifiedCertificate` functions of the `User` contract.
   - The certificate addresses are stored in `certificatesList` or `certifiedCertificates` arrays.

2. **Activating Certificates**:
   - Users activate certificates by calling the `activateCertificate` function of the `Certificate` contract.
   - The function checks the activation code and time limit, updates the state to `Active`, and emits the `CertificateActivated` event.

3. **Updating Certificate State**:
   - The state of a certificate can be updated by calling the `updateState` function of the `Certificate` contract.
   - The function updates the state and disable time, and emits the `StateUpdated` event.

### Fetching Data from Contracts

1. **User Profile**:
   - The DApp fetches the user's profile data by calling the `getCertificates` function of the `User` contract.
   - The fetched data is stored in the `userProfile` object in the global state.

2. **Certificates**:
   - The DApp fetches certificate data by calling the `getCertificate` function of the `Certificate` contract.
   - The fetched data is stored in the `certificates` object in the global state.

### Updating Global State

1. **Connecting to MetaMask**:
   - When the user connects to MetaMask, the DApp updates the `account` and `network` variables in the global state.
   - If the connected network is not the expected network, the DApp prompts the user to switch networks.

2. **Updating User Profile**:
   - When the user profile data is fetched from the contract, the DApp updates the `userProfile` object in the global state.

3. **Updating Certificates**:
   - When certificate data is fetched from the contract, the DApp updates the `certificates` object in the global state.

### Event-Driven Updates

1. **Listening for Events**:
   - The DApp listens for events emitted by the smart contracts to react to changes on the blockchain.
   - For example, the `UserRegistered`, `CertificateActivated`, and `StateUpdated` events are listened to by the DApp to update the UI and global state accordingly.

2. **Handling Event Data**:
   - When an event is detected, the DApp fetches the relevant data from the contract and updates the global state.
   - This ensures that the DApp's state is always in sync with the blockchain.

## Conclusion

This centralized data store structure ensures efficient management of user profiles, certificates, and their states within the DApp. The use of a centralized data store allows for quick lookups and updates, while providing a unified state management solution for the frontend application. Event-driven updates ensure that the DApp's state is always in sync with the blockchain, providing a seamless user experience.
