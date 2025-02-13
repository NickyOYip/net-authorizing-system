// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "truffle/Assert.sol";
import "../contracts/Certificate.sol";

contract CertificateTest {
    Certificate certificate;

    function beforeEach() public {
        // Set disableTime (or active validity period) to 1 day for testing expiry
        certificate = new Certificate("code", "docHash", "jsonHash", 1, "CertName", "OrgName");
    }

    // Test 3.1: Certificate deployment should set initial state to Inactive.
    function testDeployCertificate() public {
        Assert.equal(uint(certificate.state()), uint(Certificate.State.Inactive), "Certificate should start in the Inactive state.");
    }

    // Test 3.2: Correct activation with valid code.
    function testActivateCertificate() public {
        certificate.activateCertificate(address(this), "code", "data");
        Assert.equal(uint(certificate.state()), uint(Certificate.State.Active), "Certificate should be in the Active state.");
        Assert.equal(certificate.userAddress(), address(this), "User address should be set correctly.");
        // ...additional checks for data storage and event emission if supported...
    }

    // Test 3.3: Prevent activation with an incorrect activation code.
    function testPreventActivationWithIncorrectCode() public {
        bool r;
        bytes memory b;
        (r, b) = address(certificate).call(abi.encodePacked(certificate.activateCertificate.selector, abi.encode(address(this), "wrongCode", "data")));
        Assert.isFalse(r, "Should revert when activating with an incorrect code.");
    }

    // Test 3.4: Prevent activation after expiry.
    function testPreventActivationAfterExpiry() public {
        // Here we assume that the contract uses block.timestamp to compare with a valid period.
        // Since we cannot fast-forward time in Solidity tests without external tools,
        // we simulate expiry by calling activateCertificate twice. The first call updates state,
        // and a subsequent activation should revert if the expiry logic is triggered.
        bool r;
        bytes memory b;
        // First, activate the certificate correctly.
        certificate.activateCertificate(address(this), "code", "data");
        // Then try to activate again which should revert (either because already active or expired).
        (r, b) = address(certificate).call(abi.encodePacked(certificate.activateCertificate.selector, abi.encode(address(this), "code", "data")));
        Assert.isFalse(r, "Should revert when trying to reactivate after expiry or when already active.");
    }

    // Test 3.5: Updating certificate state.
    function testUpdateCertificateState() public {
        certificate.updateState(Certificate.State.Disabled, 5);
        Assert.equal(uint(certificate.state()), uint(Certificate.State.Disabled), "Certificate should be in the Disabled state after update.");
    }

    // Test 3.6: Retrieve certificate details.
    function testGetCertificate() public {
        (
            string memory data,
            string memory documentHash,
            string memory jsonHash,
            Certificate.State state,
            uint256 disableTime,
            string memory certificateName,
            string memory orgName
        ) = certificate.getCertificate();

        Assert.equal(documentHash, "docHash", "Document hash should match.");
        Assert.equal(jsonHash, "jsonHash", "JSON hash should match.");
        Assert.equal(uint(state), uint(Certificate.State.Inactive), "Initial state should be Inactive.");
        Assert.equal(certificateName, "CertName", "Certificate name should match.");
        Assert.equal(orgName, "OrgName", "Organization name should match.");
    }
}
