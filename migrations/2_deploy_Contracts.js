const Wax = artifacts.require('Wax')
const Dai = artifacts.require('Dai')
const Stash40 = artifacts.require('Stash40')
const Slate40 = artifacts.require('Slate40')

// New
const Factory = artifacts.require('Factory')
const Omn = artifacts.require('Omn')
const Oat = artifacts.require('Oat')

var _buyer = '0xE64aF0A0D319fb613983BB1D00A2baFfEAF1aBE9'
var admin = '0x9995d8026d970db26C8de1553957f670C2C5707b'
var rinkbey_eth = '0x1AddCFF77Ca0F032c7dCA322fd8bFE61Cae66A62'
var ropsten_eth = '0x0Be00A19538Fac4BE07AC360C69378B870c412BF'
var wei = 10**18
var writer = '0xd06f1D77E53757ECDADdC5FadB908CDb3416AB3f'
var purchaser = '0x3C8d8a68F9Cd1a9c41dE5eC8c5c14cfE73768562'

module.exports = async (deployer, accounts) => {
  // Strike price denominated in Dai tokens -> Slate
  await deployer.deploy(Dai, '1000000000000000000000000', 'Dai', 18, 'DAI', {from: purchaser})
  let dai = await Dai.deployed()
  // Underlying asset denominated in Oat -> Stash
  await deployer.deploy(Oat, '1000000000000000000000000', 'Oat', 18, 'OAT')
  let oat = await Oat.deployed()

  await deployer.deploy(Omn)
  let omn_template = await Omn.deployed()

  // Stash is the underlying asset, Oat
  await deployer.deploy(Stash40, oat.address)
  let stash40 = await Stash40.deployed()
  // Slate is strike asset, Dai
  await deployer.deploy(Slate40, stash40.address, omn_template.address, dai.address)
  let slate40 = await Slate40.deployed()
 
  await deployer.deploy(Wax)
  let wax = await Wax.deployed()

  await deployer.deploy(Factory, omn_template.address, dai.address, oat.address, slate40.address, stash40.address, wax.address)
  
  
};
