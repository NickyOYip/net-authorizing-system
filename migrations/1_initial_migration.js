const Migrations = artifacts.require("Migrations");

module.exports = function (deployer, _network, accounts) {
  deployer.deploy(Migrations, { from: accounts[0] });
};
