const ECO = artifacts.require("ECO");

let tokenAmount = 100000;
let tokenPrice = 1000000000000000; // in wei

module.exports = async deployer => {
  await deployer.deploy(ECO, tokenAmount);
};
