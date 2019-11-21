const Wax = artifacts.require('Wax')
const Dai = artifacts.require('Dai')
const Stash40 = artifacts.require('Stash40')
const Slate40 = artifacts.require('Slate40')

// New
const Factory = artifacts.require('Factory')
const Omn = artifacts.require('Omn')
const Oat = artifacts.require('Oat')
const Doz = artifacts.require('Doz')
const Zod = artifacts.require('Zod')
const Odex = artifacts.require('Odex')

var _buyer = '0xE64aF0A0D319fb613983BB1D00A2baFfEAF1aBE9'
var admin = '0x9995d8026d970db26C8de1553957f670C2C5707b'
var rinkbey_eth = '0x1AddCFF77Ca0F032c7dCA322fd8bFE61Cae66A62'
var ropsten_eth = '0x0Be00A19538Fac4BE07AC360C69378B870c412BF'
var wei = 10**18
var writer = '0xe19e523d82AB36C5bDE391F2e74c38bB4A5dC02d'
var purchaser = '0x7caBC0510f24a281DBEcCd451fB23C17e7cDc489'


module.exports = async (deployer, accounts) => {
  // Strike price denominated in Dai tokens -> Slate
  await deployer.deploy(Dai, '1000000000000000000000000', 'Dai', 18, 'DAI', {from: purchaser})
  let dai = await Dai.deployed()
  // Underlying asset denominated in Oat -> Stash
  await deployer.deploy(Oat, '1000000000000000000000000', 'Oat', 18, 'OAT')
  let oat = await Oat.deployed()

  await deployer.deploy(Zod)
  let zod_template = await Zod.deployed()

  await deployer.deploy(Doz)
  let doz_template = await Doz.deployed()
 
  await deployer.deploy(Wax)
  let wax = await Wax.deployed()

  await deployer.deploy(Odex)
  let odex = await Odex.deployed()

  await deployer.deploy(Factory, zod_template.address, doz_template.address, dai.address, oat.address, wax.address)
  
  
};
