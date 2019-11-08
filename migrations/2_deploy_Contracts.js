const Account = artifacts.require("Account");
const AccountFactory = artifacts.require('AccountFactory')
//const ECO = artifacts.require("ECO");
//const ECOFactory = artifacts.require('ECOFactory')

var _buyer = '0xE64aF0A0D319fb613983BB1D00A2baFfEAF1aBE9'
var admin = '0x9995d8026d970db26C8de1553957f670C2C5707b'

module.exports = async (deployer, accounts) => {
  await deployer.deploy(Account)
  let template = await Account.deployed()
  await deployer.deploy(AccountFactory, template.address)
  
};
