const Wax = artifacts.require('Wax')
const Stk = artifacts.require('STK')

// New
const Factory = artifacts.require('Factory')
const Udr = artifacts.require('UDR')
const cMoat = artifacts.require('cMoat')
const pMoat = artifacts.require('pMoat')
const Odex = artifacts.require('Odex')

// Controller
const InstrumentController = artifacts.require('InstrumentController')
const AssetFactory = artifacts.require('AssetFactory')
const SetFactory = artifacts.require('SetFactory')
const TokenFactory = artifacts.require('TokenFactory')
const InstrumentFactory = artifacts.require('InstrumentFactory')
const Genesis = artifacts.require('Genesis')
const GenesisToken = artifacts.require('GenesisToken')

const factories =[
    AssetFactory,
    SetFactory,
    TokenFactory,
]



module.exports = async (deployer, accounts) => {

    //var admin = accounts[0]
    //
//
    //async function deployContracts(list) {
    //    for(var i = 0; i < list.length; i++ ){
    //        await deployer.deploy(list[i])
    //    }
    //}
//
    //await deployContracts(factories)
//
    //let assetFactory = await AssetFactory.deployed()
    //let setFactory = await SetFactory.deployed()
    //let tokenFactory = await TokenFactory.deployed()
//
    //await deployer.deploy(GenesisToken)
    //let genesisToken = await GenesisToken.deployed()
    //
    //await deployer.deploy(Genesis)
    //let genesis = await Genesis.deployed()
//
    //await deployer.deploy(InstrumentFactory, genesis.address)
    //let instrumentFactory = await InstrumentFactory.deployed()
//
    //await deployer.deploy(Stk, '1000000000000000000000000', 'Strike Asset', 18, 'STK')
    //let STK = await Stk.deployed()
//
    //await deployer.deploy(Udr, '1000000000000000000000000', 'Underlying Asset', 18, 'UDR')
    //let UDR = await Udr.deployed()
    //
    //await deployer.deploy(InstrumentController, instrumentFactory.address, tokenFactory.address, assetFactory.address, setFactory.address, 1640836800, 'v0.0.1')
    //let instrumentController = await InstrumentController.deployed()
  
};
