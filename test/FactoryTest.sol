// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "truffle/Assert.sol";
import "../contracts/Factory.sol";
import "../contracts/User.sol";

contract FactoryTest {
    Factory factory;
    User user;

    function beforeEach() public {
        factory = new Factory();
        user = new User();
    }

    // Test 1.1 & 1.2: Register and retrieving a user contract.
    function testRegisterAndRetrieveUser() public {
        factory.add(address(this), address(user));
        address registeredAddress = factory.find(address(this));
        Assert.equal(registeredAddress, address(user), "User should be registered and retrieved correctly.");
    }

    // Test 1.3: Prevent duplicate user registration.
    function testPreventDuplicateUserRegistration() public {
        factory.add(address(this), address(user));
        bool r;
        bytes memory b;
        (r, b) = address(factory).call(abi.encodePacked(factory.add.selector, abi.encode(address(this), address(user))));
        Assert.isFalse(r, "Should revert when trying to register the same user twice.");
    }
}
