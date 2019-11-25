/*
@title A full test which implements multiple parts, UDR, STK, cMoat, and pMoat for the rinkeby testnet

@notice Users can buy, write, trade, exercise, and close the MOATs

@author Alexander Angel

@dev First tests just check initalization, then we test user's interaction with the dex
     then we process transactions through the MUDR, and finally we settle on the dex.
*/

const assert = require('assert').strict;
const Factory = artifacts.require('Factory')
const Wax = artifacts.require('Wax')
const Stk = artifacts.require('STK') // Strike Asset
const Udr = artifacts.require('UDR') // Underlying Asset
const cMoat = artifacts.require('cMoat') // Optionality Purchase Transfer Right -> Purchaser underlying for strike
const pMoat = artifacts.require('pMoat') // Optionality Sale Transfer Right -> Sell underlying for strike
const InstrumentController = artifacts.require('InstrumentController')
const Genesis = artifacts.require('Genesis')
const GenesisToken = artifacts.require('GenesisToken')


contract('Controller', accounts => {


    // Starting users to use in test
    var users_test = 2


    // User Accounts
    var Alice = accounts[0]
    var Bob = accounts[1]
    var Mary = accounts[2]
    var Kiln = accounts[3]
    var Don = accounts[4]
    var Penny = accounts[5]
    var Cat = accounts[6]
    var Bjork = accounts[7]
    var Olga = accounts[8]
    var Treasury = accounts[9]
    var typeC = 'C'
    var typeP = 'P'


    // Accounts Array
    var acc_ray = [
        ['Alice', Alice],
        ['Bob', Bob],
        ['Mary', Mary],
        ['Kiln', Kiln],
        ['Don', Don],
        ['Penny', Penny],
        ['Cat', Cat],
        ['Bjork', Bjork],
        ['Olga', Olga],
        ['Treasury', Treasury]
    ]

    var gas = []
    var symbol = 'v0.0.1'
    var ratio = 5

    async function getGas(func, name) {
        /*
        @param func function to get gas from
        @param name string of function name
        */
        let spent = await func.receipt.gasUsed
        gas.push([name + ' gas: ', spent])
    }

    it('Creates Instrument Controller', async () => {
        let instance = await InstrumentController.deployed()
        let udr = await Udr.deployed()
        let stk = await Stk.deployed()
        let genesisToken = await GenesisToken.deployed()
        
        let createInstrument = await instance.createInstrument(symbol, udr.address, stk.address, ratio, genesisToken.address)
        await getGas(createInstrument, 'Create Instrument')
        //console.log(instance)
        console.log(gas)
        console.log((await instance.sets__expiration(symbol, 1)).toString())
        console.log((await instance.assetPair__strike_asset__name(symbol)))
        console.log((await instance.instruments__iaddress(symbol)))
        let genesis = await Genesis.at((await instance.instruments__iaddress(symbol)))

        console.log(await genesis.admin())
        console.log((await genesis.set(1)).toString())

        console.log((await instance.tokens__expiration(symbol)).toString())
    });

})