const Certificate = artifacts.require("Certificate");

module.exports = async function (deployer) {
  const activeCode = "sampleActiveCode";
  const documentHash = "sampleDocumentHash";
  const jsonHash = "sampleJsonHash";
  const disableTime = 30; // 30 days

  await deployer.deploy(Certificate, activeCode, documentHash, jsonHash, disableTime);
};