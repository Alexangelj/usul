const Account = artifacts.require("Account");
const AccountFactory = artifacts.require('AccountFactory')
const ECO = artifacts.require("ECO");
const ECOFactory = artifacts.require('ECOFactory')
const ECOPriceOracle = artifacts.require('ECOPriceOracle')
const Slate = artifacts.require('Slate')
const Stash = artifacts.require('Stash')
const Wax = artifacts.require('Wax')

var _buyer = '0xE64aF0A0D319fb613983BB1D00A2baFfEAF1aBE9'
var admin = '0x9995d8026d970db26C8de1553957f670C2C5707b'
var rinkbey_eth = '0x1AddCFF77Ca0F032c7dCA322fd8bFE61Cae66A62'
var ropsten_eth = '0x0Be00A19538Fac4BE07AC360C69378B870c412BF'

module.exports = async (deployer, accounts) => {
  await deployer.deploy(ECOPriceOracle, rinkbey_eth)
  let oracle = await ECOPriceOracle.deployed()

  await deployer.deploy(Account)
  let acc_template = await Account.deployed()
  await deployer.deploy(AccountFactory, acc_template.address)

  await deployer.deploy(ECO)
  let eco_template = await ECO.deployed()
  await deployer.deploy(Stash)
  let stash = await Stash.deployed()
  await deployer.deploy(Slate, stash.address, eco_template.address)
  let slate = await Slate.deployed()
  await deployer.deploy(Wax)
  let wax = await Wax.deployed()
  await deployer.deploy(ECOFactory, eco_template.address, oracle.address, slate.address, stash.address, wax.address)
  
  
  //let stash = await Stash.deployed()
  //await deployer.deploy(Slate, stash.address, eco_template.address)
  //let slate = await Slate.deployed()
  
  
};
