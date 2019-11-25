const Wax = artifacts.require('Wax')
const Stk = artifacts.require('STK')

// New
const Factory = artifacts.require('Factory')
const Udr = artifacts.require('UDR')
const cMoat = artifacts.require('cMoat')
const pMoat = artifacts.require('pMoat')
const Odex = artifacts.require('Odex')

var _buyer = '0xE64aF0A0D319fb613983BB1D00A2baFfEAF1aBE9'
var admin = '0x9995d8026d970db26C8de1553957f670C2C5707b'
var rinkbey_eth = '0x1AddCFF77Ca0F032c7dCA322fd8bFE61Cae66A62'
var ropsten_eth = '0x0Be00A19538Fac4BE07AC360C69378B870c412BF'
var wei = 10**18
var writer = '0xe19e523d82AB36C5bDE391F2e74c38bB4A5dC02d'
var purchaser = '0x7caBC0510f24a281DBEcCd451fB23C17e7cDc489'
var rinkeby_accounts1 = '0x81fd2e1a63402119be2922fcc577fe7a4fac2358'
var ganache0 = '0x9cfDd4267225D9D557658e5d758978bEAdAf7B15'
var ganache1 = '0x7bFc572Ba5a084C9b09111C3dCB93E9E7283A215'

module.exports = async (deployer, accounts) => {
  // Strike price denominated in Dai tokens -> Slate
  //await deployer.deploy(Stk, '1000000000000000000000000', 'Strike Asset', 18, 'STK', {from: ganache1})
  //let STK = await Stk.deployed()
  //// Underlying asset denominated in Oat -> Stash
  //await deployer.deploy(Udr, '1000000000000000000000000', 'Underlying Asset', 18, 'UDR')
  //let UDR = await Udr.deployed()
//
  //await deployer.deploy(pMoat)
  //let pMoat_template = await pMoat.deployed()
//
  //await deployer.deploy(cMoat)
  //let cMoat_template = await cMoat.deployed()
 //
  //await deployer.deploy(Wax)
  //let wax = await Wax.deployed()
//
//
  //await deployer.deploy(Factory, pMoat_template.address, cMoat_template.address, STK.address, UDR.address, wax.address)
  
  
};
