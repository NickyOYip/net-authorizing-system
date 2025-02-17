# Development Notes

## Overview

This document provides an overview of how the Solidity contracts work with the DApp, including the interactions between the frontend and the smart contracts.

## Roles in the DApp

The roles of user, verifier, and certifier are conceptual and any user can perform any role. A single user can also perform all three roles.

### User
- **Purpose**: Activates certificates and sends e-certificates and JSON certificates to verifiers.
- **Actions**:
  - Activates certificates using the activation code provided by the certifier.
  - Sends e-certificates and JSON certificates to verifiers for validation.

### Verifier
- **Purpose**: Validates e-certificates and JSON certificates by checking their hashes.
- **Actions**:
  - Receives e-certificates and JSON certificates from users.
  - Validates the certificates by checking the hashes against the stored data.

### Certifier
- **Purpose**: Deploys certificates and provides activation codes to users.
- **Actions**:
  - Deploys certificates using the `Certificate` contract.
  - Sends activation codes to users.
  - Waits for users to activate the certificates within one day.

## Solidity Contracts

### User Contract

**Purpose**: Manages user profiles, storing certified certificates and encrypted view codes.

**Functions**:
- `addCertificate(address _certificate)`: Adds a certificate to the general list.
- `addCertifiedCertificate(address _certificate)`: Adds a certificate to the certified list.
- `getCertificates()`: Retrieves all stored certificates.
- `getCertifiedCertificates()`: Retrieves all certified certificates.

### Factory Contract

**Purpose**: Registers users and associates them with contract addresses.

**Functions**:
- `add(address userAddress, address contractAddress)`: Registers a new user by associating their address with a contract address.
- `find(address userAddress)`: Retrieves the contract address associated with a specific user.

**Events**:
- `UserRegistered(address indexed user, address contractAddress, uint256 timestamp)`: Emitted when a new user is registered.

### Certificate Contract

**Purpose**: Manages certificate data, state transitions, and activation processes.

**Functions**:
- `activateCertificate(address _userAddress, string memory _activeCode, string memory _data)`: Activates the certificate if within the activation time limit.
- `updateState(State _newState, uint256 _disableTime)`: Updates the certificate's state and sets a disable time if needed.
- `getCertificate()`: Retrieves the certificate data along with other details.

**Events**:
- `CertificateActivated(address indexed user, uint256 timestamp)`: Emitted when a certificate is activated.
- `StateUpdated(State newState, uint256 disableTime, uint256 timestamp)`: Emitted when the state of a certificate is updated.

## How the DApp Interacts with the Contracts

### Connecting to MetaMask

- The DApp uses the `MetaMaskProvider` component to connect to MetaMask and manage the user's account and network state.
- When the user clicks the "Connect to MetaMask" button, the `connect` function in `MetaMaskProvider` is called, which requests the user's accounts and updates the state with the connected account and network.

### Managing Global State

- The `DataProvider` component provides a centralized data store for the application, managing the state of the user's account, network, and other global variables like `count`.
- Components like `Counter` and `App` use the `DataContext` to access and update the global state.

### Interacting with Smart Contracts

- The DApp can interact with the smart contracts deployed on the blockchain using the `ethers.js` library.
- For example, to add a certificate, the DApp can call the `addCertificate` function of the `User` contract by creating an instance of the contract using `ethers.Contract` and calling the function with the appropriate parameters.
- Similarly, the DApp can call other functions like `activateCertificate` and `updateState` to manage certificates.

### Handling Events

- The DApp can listen for events emitted by the smart contracts to react to changes on the blockchain.
- For example, when a user is registered, the `UserRegistered` event is emitted by the `Factory` contract. The DApp can listen for this event and update the UI accordingly.
- Similarly, the `CertificateActivated` and `StateUpdated` events emitted by the `Certificate` contract can be listened to by the DApp to update the UI when a certificate is activated or its state is updated.

## Example Interaction Flow

### User Registration (Any User)

- Any user calls the `add` function of the `Factory` contract to register a new user and associate their address with a contract address.
- The `UserRegistered` event is emitted, and the user's address and contract address are stored in the `userToContract` mapping.

### Adding a Certificate (Certifier)

- The certifier calls the `addCertifiedCertificate` function of the `User` contract to add a new certificate to the `certifiedCertificates` list.
- The certificate address is added to the `certifiedCertificates` array, and the `isInCertifiedList` mapping is updated to track the existence of the certificate.

### Activating a Certificate (User)

- The user calls the `activateCertificate` function of the `Certificate` contract to activate a certificate.
- The function checks the activation code and time limit, updates the state to `Active`, and emits the `CertificateActivated` event.
- The activated certificate is added to the `certificatesList` array in the `User` contract.

### Sending Certificates to Verifier (User)

- The user sends their e-certificates and JSON certificates to the verifier for validation.

### Validating Certificates (Verifier)

- The verifier receives the e-certificates and JSON certificates from the user.
- The verifier validates the certificates by checking the hashes against the stored data.

### Updating Certificate State (Certifier)

- The certifier calls the `updateState` function of the `Certificate` contract to update the state of a certificate.
- The function updates the state and disable time, and emits the `StateUpdated` event.

## Conclusion

This setup allows your DApp to manage user profiles, certificates, and their states using the smart contracts deployed on the blockchain, while providing a seamless user experience through the React frontend. The DApp can also listen for events emitted by the smart contracts to react to changes on the blockchain and update the UI accordingly. The conceptual roles of user, verifier, and certifier ensure a comprehensive verification platform where certificates can be deployed, activated, and validated efficiently. Any user can perform any role, and a single user can perform all three roles.

Note: The global data store is reactive and automatically refreshes with any update, ensuring that the latest data is immediately available in the UI.
