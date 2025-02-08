// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "truffle/Assert.sol";
import "../contracts/User.sol";
import "../contracts/Certificate.sol";

contract UserTest {
    User user;
    Certificate certificate;

    function beforeEach() public {
        user = new User();
        certificate = new Certificate("code", "docHash", "jsonHash", 10);
    }

    // Test 2.1: Adding a Certificate.
    function testAddCertificate() public {
        user.addCertificate(address(certificate));
        address[] memory certs = user.getCertificates();
        Assert.equal(certs[0], address(certificate), "Certificate should be added to the list.");
    }

    // Test 2.2: Prevent adding duplicate certificates.
    function testPreventDuplicateCertificate() public {
        user.addCertificate(address(certificate));
        bool r;
        bytes memory b;
        (r, b) = address(user).call(abi.encodePacked(user.addCertificate.selector, abi.encode(address(certificate))));
        Assert.isFalse(r, "Should revert when trying to add the same certificate twice.");
    }

    // Test 2.3: Adding a Certified Certificate.
    function testAddCertifiedCertificate() public {
        user.addCertifiedCertificate(address(certificate));
        address[] memory certs = user.getCertifiedCertificates();
        Assert.equal(certs[0], address(certificate), "Certified certificate should be added to the list.");
    }

    // Test 2.4: Prevent duplicate certified certificate.
    function testPreventDuplicateCertifiedCertificate() public {
        user.addCertifiedCertificate(address(certificate));
        bool r;
        bytes memory b;
        (r, b) = address(user).call(abi.encodePacked(user.addCertifiedCertificate.selector, abi.encode(address(certificate))));
        Assert.isFalse(r, "Should revert when trying to add the same certified certificate twice.");
    }
}
