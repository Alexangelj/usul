const assert = require('assert').strict;
const Account = artifacts.require("Account");
const AccountFactory = artifacts.require('AccountFactory')
const ECO = artifacts.require("ECO");
const ECOFactory = artifacts.require('ECOFactory')
const ECOPriceOracle = artifacts.require('ECOPriceOracle')
const Slate20 = artifacts.require('Slate20')
const Stash20 = artifacts.require('Stash20')
const Wax = artifacts.require('Wax')
const Dai = artifacts.require('Dai')
const ARC = artifacts.require('Arc')

contract('Arc', accounts => {

    var writer = accounts[0]
    var purchaser = accounts[1]
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

    async function checkBalances(arc_address, slate20_addr, stash20_addr, dai){
        var bal_before = [
            'purchaser: ',
            'writer: ',
            'ARC: ',
            'Slate20 ETH: ',
            'Stash20 ETH: ',
        ]
        var acc_list = [
            purchaser,
            writer,
            arc_address,
            slate20_addr,
            stash20_addr,
        ]
        for(var i = 0; i < acc_list.length; i++) {
            console.log(bal_before[i], await web3.eth.getBalance(acc_list[i])/10**18)
        }
        console.log('Stash20 DAI: ', dai)
    }


    it('Creates Stash20 Contract', async () => {
        console.log('\n')
        let stash20 = await Stash20.deployed()
        console.log('Stash20: ', stash20.address)
    });

    it('Creates Slate20 Contract', async () => {
        console.log('\n')
        let slate20 = await Slate20.deployed()
        console.log('Slate20: ', slate20.address)
    });

    it('Creates arc Contract', async () => {
        console.log('\n')
        let arc_fac = await ECOFactory.deployed()
        let arc = await arc_fac.createEco(  purchaser,
                                            writer,  
                                            strike, 
                                            notional, 
                                            maturity,
                                            margin,
                                            true
                                            )
        //let eco_address = await eco_fac.getEco(purchaser)
        //let _eco = await ECO.at(eco_address)
    });

    it('Write Function Test', async () => {
        let dai = await Dai.deployed()
        let eco_fac = await ECOFactory.deployed()
        let arc_address = await eco_fac.getEco(purchaser)
        let _arc = await ARC.at(arc_address)
        let slate20 = await Slate20.deployed()
        let stash20 = await Stash20.deployed()
        let dai_arc = await dai.transfer(arc_address, '100000000000000000000')
        let sbal1 = (await dai.balanceOf(stash20.address)).toString()
        console.log('Stash20: ', sbal1/wei)
        let write = await _arc.write(arc_address, premium, '3000000000000000000', {from: writer})
        let sbal2 = (await dai.balanceOf(stash20.address)).toString()
        console.log('Stash20 ', sbal2/wei)
        let write_gas = await write.receipt.gasUsed
        console.log('write Gas Internal: ', write_gas)
        await getGas(write, 'write internal')

        let wrote = await slate20.wrote(arc_address)
        console.log('Wrote: ', wrote)
        assert.equal(wrote, writer, 'Should be writer writing')

        let fund = await stash20.fund(writer)
        console.log('Fund: ', (fund).toString())
        assert.strictEqual((fund/wei).toString(), margin.toString(), 'Writer should have funded Stash20')

        console.log('Should have transferred margin: 3 to Stash20')
        await checkBalances(arc_address, slate20.address, stash20.address, sbal2)
    });

    it('Purchase Function Test', async () => {
        let dai = await Dai.deployed()
        let eco_fac = await ECOFactory.deployed()
        let arc_address = await eco_fac.getEco(purchaser)
        let _arc = await ARC.at(arc_address)
        let slate20 = await Slate20.deployed()
        let stash20 = await Stash20.deployed()
        
        let purchase = await _arc.purchase(arc_address, premium, {from: purchaser, value: premium*wei })
        let purchase_gas = await purchase.receipt.gasUsed
        console.log('purchase Gas Internal: ', purchase_gas)
        await getGas(purchase, 'purchase internal')

        let bought = await slate20.bought(arc_address)
        console.log('Bought: ', bought)
        assert.equal(bought, purchaser, 'Should be purchaser purchasing')

        let prm = await slate20.premium(purchaser)
        console.log('Premium: ', prm.toNumber())
        assert.strictEqual(prm.toNumber(), premium, 'purchaser should have paid premium')
        
        console.log('Should have transferred premium: 1 to Slate20')
        let dai_bal = (await dai.balanceOf(stash20.address)).toString()
        await checkBalances(arc_address, slate20.address, stash20.address, dai_bal)
    });

    it('arc Validation', async () => {
        console.log('\n')
        let dai = await Dai.deployed()
        let arc_fac = await ECOFactory.deployed()
        let arc_address = await arc_fac.getEco(purchaser)
        let _arc = await ARC.at(arc_address)
        let slate20 = await Slate20.deployed()
        let stash20 = await Stash20.deployed()
        let fund = await stash20.fund(writer)
        let bought = await slate20.bought(arc_address)
        let prmium = await slate20.premium(purchaser)
        
        let sbal1 = (await dai.balanceOf(stash20.address)).toString()
        
        assert.strictEqual(bought, purchaser, 'Option address should match buyer')
        assert.strictEqual(prmium.toString(), premium.toString(), 'Should have paid premium')
        assert.strictEqual((fund/wei).toString(), (sbal1/wei).toString(), 'Stash20 balance should equal writer margin')
        console.log(fund.toString())
        console.log(await _arc.margin())
        let validation = await _arc.validate()
        let validation_gas = await validation.receipt.gasUsed
        console.log('validation Gas Internal: ', validation_gas)
        await getGas(validation, 'validation')

        //let log = await validation.receipt.logs[0].args
        //console.log(log)
        
        let dai_bal = (await dai.balanceOf(stash20.address)).toString()
        await checkBalances(arc_address, slate20.address, stash20.address, dai_bal)
    });

    it('arc Maturity', async () => {
        console.log('\n')
        let dai = await Dai.deployed()
        let arc_fac = await ECOFactory.deployed()
        let arc_address = await arc_fac.getEco(purchaser)
        let _arc = await ARC.at(arc_address)
        let slate20 = await Slate20.deployed()
        let stash20 = await Stash20.deployed()
        let wax = await Wax.deployed()
        
        let mature = await _arc.isMature()
        let mature_gas = await mature.receipt.gasUsed
        console.log('mature Gas Internal: ', mature_gas)
        await getGas(mature, 'mature')

        let timestamp = await wax.expiration(arc_address)
        console.log('Expiration timestamp: ', timestamp.toNumber())

        let dai_bal = (await dai.balanceOf(stash20.address)).toString()
        await checkBalances(arc_address, slate20.address, stash20.address, dai_bal)
    });

    it('arc Exercise', async () => {
        console.log('\n')
        let dai = await Dai.deployed()
        let arc_fac = await ECOFactory.deployed()
        let arc_address = await arc_fac.getEco(purchaser)
        let _arc = await ARC.at(arc_address)
        let slate20 = await Slate20.deployed()
        let stash20 = await Stash20.deployed()

        let exercise = await _arc.exercise({from: purchaser})
        let exercise_gas = await exercise.receipt.gasUsed
        console.log('exercise Gas Internal: ', exercise_gas)
        await getGas(exercise, 'exercise')

        let dai_bal = (await dai.balanceOf(stash20.address)).toString()
        await checkBalances(arc_address, slate20.address, stash20.address, dai_bal)
        console.log(gas)
    });


})