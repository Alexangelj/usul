const Account = artifacts.require("Account");

let tokenAmount = 100000;
let tokenPrice = 1000000000000000; // in wei

module.exports = async deployer => {
  await deployer.deploy(Account);
};
