const assert = require('assert').strict;
const Account = artifacts.require("Account");
const AccountFactory = artifacts.require('AccountFactory')
const ECO = artifacts.require("ECO");
const ECOFactory = artifacts.require('ECOFactory')
const ECOPriceOracle = artifacts.require('ECOPriceOracle')
const Slate = artifacts.require('Slate')
const Stash = artifacts.require('Stash')

contract('Stash', accounts => {

    var writer = accounts[0]
    var purchaser = accounts[0]
    var premium = 1
    var margin = premium * 3
    var wei = 10**18
    var gas = []
    var strk = 1 // in uint256
    var notional = 2 // uint256 this is amount the contract handles
    var maturity = 10 // time in seconds?
    var margin_multiplier = 3 // 300% margin for a 150% covered call option writer
    var margin_deposit = strk * notional * margin_multiplier // uint256 required margin from writer
    var underlying = 2
    var underlying_value = underlying * notional
    var premium_multipler = 1
    var premium = strk * premium_multipler
    var strike_value = strk * notional
    var strike = 1

    

    async function getGas(func, name) {
        let spent = await func.receipt.gasUsed
        gas.push([name + ' gas: ', spent])
    }

    it('Creates Stash Contract', async () => {
        console.log('\n')
        let stash = await Stash.deployed()
        console.log('Stash: ', stash.address)
    });

    it('Creates Slate Contract', async () => {
        console.log('\n')
        let slate = await Slate.deployed()
        console.log('Slate: ', slate.address)
    });

    it('Creates ECO Contract', async () => {
        console.log('\n')
        let eco_fac = await ECOFactory.deployed()
        let eco = await eco_fac.createEco(  purchaser,
                                            writer,  
                                            strike, 
                                            notional, 
                                            maturity,
                                            margin
                                            )
        let eco_address = await eco_fac.getEco(purchaser)
        let _eco = await ECO.at(eco_address)
    });

    it('Write Function Test', async () => {
        console.log('\n')
        let slate = await Slate.deployed()
        let stash = await Stash.deployed()
        let eco = await ECO.deployed()
        
        let write = await slate.write(eco.address, premium, margin)
        let write_gas = await write.receipt.gasUsed
        console.log('Write Gas: ', write_gas)
        await getGas(write, 'write')
        
        let logs = await write.receipt.logs[0].event
        console.log('Event: ', logs)

        let wrote = await slate.wrote(eco.address)
        console.log('Wrote: ', wrote)
        assert.equal(wrote, writer, 'Should be writer writing')

        let fund = await stash.fund(writer)
        console.log('Fund: ', fund.toNumber())
        assert.strictEqual(fund.toNumber(), margin, 'Writer should have funded Stash')
    });

    it('Purchase Function Test', async () => {
        console.log('\n')
        let slate = await Slate.deployed()
        let stash = await Stash.deployed()
        let eco = await ECO.deployed()
        
        let purchase = await slate.purchase(eco.address, premium, {from: purchaser})
        let purchase_gas = await purchase.receipt.gasUsed
        console.log('purchase Gas: ', purchase_gas)
        await getGas(purchase, 'purchase')
        
        let logs = await purchase.receipt.logs[0].event
        console.log('Event: ', logs)

        let bought = await slate.bought(eco.address)
        console.log('Bought: ', bought)
        assert.equal(bought, purchaser, 'Should be purchaser purchasing')

        let prm = await slate.premium(purchaser)
        console.log('Premium: ', prm.toNumber())
        assert.strictEqual(prm.toNumber(), premium, 'purchaser should have paid premium')
    });

    it('ECO Purchase Internal', async () => {
        console.log('\n')
        let eco_fac = await ECOFactory.deployed()
        let eco_address = await eco_fac.getEco(purchaser)
        let _eco = await ECO.at(eco_address)
        let slate = await Slate.deployed()
        let stash = await Stash.deployed()

        let bought = await _eco.purchase(eco_address, prm, {from: purchaser, value: premium_wei })
        console.log(bought)
    });

})