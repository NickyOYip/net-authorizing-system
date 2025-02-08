const User = artifacts.require("User");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(User, { from: accounts[1] });
};