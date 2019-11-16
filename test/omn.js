const assert = require('assert').strict;
const Factory = artifacts.require('Factory')
const Slate40 = artifacts.require('Slate40')
const Stash40 = artifacts.require('Stash40')
const Wax = artifacts.require('Wax')
const Dai = artifacts.require('Dai')
const Oat = artifacts.require('Oat')
const Omn = artifacts.require('Omn')

contract('omn', accounts => {

    // ** Description **
    // Purchaser will have dai to purchase the underlying
    // Writer will have oat to underwrite

    var writer = accounts[0]
    var purchaser = accounts[1]
    var decimals = 10**18
    var gas = []
    var strike = (10*decimals).toFixed() // Dai amount paid for underlying
    var underlying = (2*decimals).toFixed() // Oat amount sold for strike asset
    var maturity = 1573992000 // valid 11/17/2019 12pm utc


    console.log('Strike: ', strike,'Underlying: ', underlying)

    async function getGas(func, name) {
        let spent = await func.receipt.gasUsed
        gas.push([name + ' gas: ', spent])
    }

    async function checkBalances(omn_address, slate40_addr, stash40_addr, dai, oat){
        var bal_before = [
            'omn: ',
            'Slate40 ETH: ',
            'Stash40 ETH: ',
        ]
        var acc_list = [
            omn_address,
            slate40_addr,
            stash40_addr,
        ]
        for(var i = 0; i < acc_list.length; i++) {
            console.log(bal_before[i], await web3.eth.getBalance(acc_list[i])/10**18)
        }
        console.log('Slate40 Dai: ', dai)
        console.log('Stash40 OAT: ', oat)
    }


    it('Creates Stash40 Contract', async () => {
        console.log('\n')
        let stash40 = await Stash40.deployed()
        console.log('Stash40: ', stash40.address)
    });

    it('Creates Slate40 Contract', async () => {
        console.log('\n')
        let slate40 = await Slate40.deployed()
        console.log('Slate40: ', slate40.address)
    });

    it('Creates omn Contract', async () => {
        console.log('\n')
        let slate40 = await Slate40.deployed()
        let stash40 = await Stash40.deployed()
        let omn_fac = await Factory.deployed()
        let omn = await omn_fac.createOmn(  strike, 
                                            underlying, 
                                            maturity,
                                            )
        
        // Get gas usage
        let omn_gas = await omn.receipt.gasUsed
        console.log('omn Gas Internal: ', omn_gas)
        await getGas(omn, 'omn internal')

        let dai = await Dai.deployed()
        let oat = await Oat.deployed()
        let omn_address = await omn_fac.getOmn(writer)
        let _omn = await Omn.at(omn_address)
        let omn_dai = (await dai.balanceOf(omn_address)).toString()
        let writer_dai = (await dai.balanceOf(writer)).toString()
        let purchaser_dai = (await dai.balanceOf(purchaser)).toString()
        let writer_oat = (await oat.balanceOf(writer)).toString()
        let purchaser_oat = (await oat.balanceOf(purchaser)).toString()
        let slate_dai = (await dai.balanceOf(slate40.address)).toString()
        let stash_oat = (await oat.balanceOf(stash40.address)).toString()
        console.log('omn Dai: ', omn_dai)
        console.log('Writer Dai: ', writer_dai)
        console.log('Writer oat: ', writer_oat)
        console.log('Purchaser Dai: ', purchaser_dai)
        console.log('Purchaser oat: ', purchaser_oat)
        console.log('Slate Dai: ', slate_dai)
        console.log('Stash oat: ', stash_oat)
        console.log(' *** End omn Create *** ')
    });

    it('Write Function Test', async () => {
        console.log(' *** Writes ***')
        // ** Description **
        // Writer is going to provide underlying asset (oat) in this case by
        // sending it to the stash (auxillary storage for underlying)
        
        // Get instances
        // Tokens
        let dai = await Dai.deployed()
        let oat = await Oat.deployed()
        // Options contracts
        let omn_fac = await Factory.deployed()
        let omn_address = await omn_fac.getOmn(writer)
        let _omn = await Omn.at(omn_address)
        // Auxillary storage
        let slate40 = await Slate40.deployed()
        let stash40 = await Stash40.deployed()

        // Get Oat Balance of Stash40
        //let dai_omn = await dai.transfer(omn_address, '100000000000000000000')
        let stash_bal_prior = (await oat.balanceOf(stash40.address)).toString()
        console.log('Stash40: ', stash_bal_prior)


        console.log('underlying Deposited: ', underlying)
        let approve = await oat.approve(omn_address, underlying)
        let write = await _omn.write(underlying, {from: writer})
        
        
        // Get Stash40 OAT Balance -> Should be equal to underlying
        let stash_bal = (await oat.balanceOf(stash40.address)).toString()
        console.log('Stash40: ', stash_bal)
        
        // Get gas usage
        let write_gas = await write.receipt.gasUsed
        console.log('write Gas Internal: ', write_gas)
        await getGas(write, 'write internal')

        // Confirm writer is writer of contract
        let wrote = await stash40.wrote(omn_address)
        console.log('Wrote: ', wrote)
        assert.equal(wrote, writer, 'Should be writer writing')

        // Confirm funds deposited, can be removed because this is for cash settled
        let fund = await stash40.fund(writer)
        console.log('Fund: ', (fund).toString())
        assert.strictEqual((fund).toString(), underlying.toString(), 'Writer should have funded Stash40')

        // oat balances of users
        let omn_oat = (await oat.balanceOf(omn_address)).toString()
        let writer_oat = (await oat.balanceOf(writer)).toString()
        let purchaser_oat = (await oat.balanceOf(purchaser)).toString()
        console.log('omn oat: ', omn_oat)
        console.log('Writer oat: ', writer_oat)
        console.log('Purchaser oat: ', purchaser_oat)

        let slate_bal = (await dai.blanaceOf(slate40.address)).toString()
        // Get Balances of Accts
        console.log('Should have transferred underlying: ' + underlying.toString() + ' to Stash40')
        await checkBalances(omn_address, slate40.address, stash40.address, slate_bal, stash_bal)
    });
//
    //it('Purchase Function Test', async () => {
    //    console.log(' *** Purchases ***')
    //    // Get instances
    //    let dai = await Dai.deployed()
    //    let omn_fac = await Factory.deployed()
    //    let omn_address = await omn_fac.getOmn(purchaser)
    //    let _omn = await Omn.at(omn_address)
    //    let slate40 = await Slate40.deployed()
    //    let stash40 = await Stash40.deployed()
    //    
    //    // Purchase function, should pay premium
    //    let purchase = await _omn.purchase(premium, {from: purchaser, value: premium })
    //    
    //    // Get gas usage
    //    let purchase_gas = await purchase.receipt.gasUsed
    //    console.log('purchase Gas Internal: ', purchase_gas)
    //    await getGas(purchase, 'purchase internal')
//
    //    // Confirms purchase
    //    let bought = await slate40.bought(omn_address)
    //    console.log('Bought: ', bought)
    //    assert.equal(bought, purchaser, 'Should be purchaser purchasing')
//
    //    // Confirms premium was paid
    //    let prm = await slate40.premium(purchaser)
    //    console.log('Premium: ', prm.toString())
    //    assert.strictEqual(prm.toString(), premium, 'purchaser should have paid premium')
    //    
    //    // Dai balances of users
    //    let omn_dai = (await dai.balanceOf(omn_address)).toString()
    //    let writer_dai = (await dai.balanceOf(writer)).toString()
    //    let purchaser_dai = (await dai.balanceOf(purchaser)).toString()
    //    console.log('omn Dai: ', omn_dai)
    //    console.log('Writer Dai: ', writer_dai)
    //    console.log('Purchaser Dai: ', purchaser_dai)
//
    //    // Checks balances
    //    console.log('Should have transferred premium: ' + premium.toString() + ' to Slate40')
    //    let dai_bal = (await dai.balanceOf(stash40.address)).toString()
    //    await checkBalances(omn_address, slate40.address, stash40.address, dai_bal)
    //});
//
    //it('omn Validation', async () => {
    //    console.log(' *** Validates ***')
    //    let dai = await Dai.deployed()
    //    let omn_fac = await Factory.deployed()
    //    let omn_address = await omn_fac.getOmn(purchaser)
    //    let _omn = await Omn.at(omn_address)
    //    let slate40 = await Slate40.deployed()
    //    let stash40 = await Stash40.deployed()
    //    let fund = await stash40.fund(writer)
    //    let bought = await slate40.bought(omn_address)
    //    let prmium = await slate40.premium(purchaser)
    //    
    //    let sbal1 = (await dai.balanceOf(stash40.address)).toString()
    //    
    //    assert.strictEqual(bought, purchaser, 'Option address should match buyer')
    //    assert.strictEqual(prmium.toString(), premium.toString(), 'Should have paid premium')
    //    assert.strictEqual((fund/wei).toString(), (sbal1/wei).toString(), 'Stash40 balance should equal writer underlying')
//
    //    let validation = await _omn.validate()
    //    let validation_gas = await validation.receipt.gasUsed
    //    console.log('validation Gas Internal: ', validation_gas)
    //    await getGas(validation, 'validation')
    //    
    //    // Dai balances of users
    //    let omn_dai = (await dai.balanceOf(omn_address)).toString()
    //    let writer_dai = (await dai.balanceOf(writer)).toString()
    //    let purchaser_dai = (await dai.balanceOf(purchaser)).toString()
    //    console.log('omn Dai: ', omn_dai)
    //    console.log('Writer Dai: ', writer_dai)
    //    console.log('Purchaser Dai: ', purchaser_dai)
//
    //    let dai_bal = (await dai.balanceOf(stash40.address)).toString()
    //    await checkBalances(omn_address, slate40.address, stash40.address, dai_bal)
    //});
//
    //it('omn Maturity', async () => {
    //    console.log('\n')
    //    let dai = await Dai.deployed()
    //    let omn_fac = await Factory.deployed()
    //    let omn_address = await omn_fac.getOmn(purchaser)
    //    let _omn = await Omn.at(omn_address)
    //    let slate40 = await Slate40.deployed()
    //    let stash40 = await Stash40.deployed()
    //    let wax = await Wax.deployed()
    //    
    //    let mature = await _omn.isMature()
    //    
//
    //    let timestamp = await wax.expiration(omn_address)
    //    console.log('Expiration timestamp: ', (timestamp.toNumber()))
//
    //    // Dai balances of users
    //    let omn_dai = (await dai.balanceOf(omn_address)).toString()
    //    let writer_dai = (await dai.balanceOf(writer)).toString()
    //    let purchaser_dai = (await dai.balanceOf(purchaser)).toString()
    //    console.log('omn Dai: ', omn_dai)
    //    console.log('Writer Dai: ', writer_dai)
    //    console.log('Purchaser Dai: ', purchaser_dai)
//
    //    let dai_bal = (await dai.balanceOf(stash40.address)).toString()
    //    await checkBalances(omn_address, slate40.address, stash40.address, dai_bal)
    //});
//
    //it('omn Exercise', async () => {
    //    // Get contract instances
    //    console.log('\n')
    //    let dai = await Dai.deployed()
    //    let omn_fac = await Factory.deployed()
    //    let omn_address = await omn_fac.getOmn(purchaser)
    //    let _omn = await Omn.at(omn_address)
    //    let slate40 = await Slate40.deployed()
    //    let stash40 = await Stash40.deployed()
//
    //    // Exercise comes from buyer, where they pay for the underlying at the strike price (in wei)
    //    let exercise = await _omn.exercise({from: purchaser, value: strike_val})
    //    
    //    // Get gas usage
    //    let exercise_gas = await exercise.receipt.gasUsed
    //    console.log('exercise Gas Internal: ', exercise_gas)
    //    await getGas(exercise, 'exercise')
//
    //    // Get dai balance of stash
    //    let dai_bal = (await dai.balanceOf(stash40.address)).toString()
    //    await checkBalances(omn_address, slate40.address, stash40.address, dai_bal)
    //    
    //    // Get Dai balances of users
    //    let omn_dai = (await dai.balanceOf(omn_address)).toString()
    //    let writer_dai = (await dai.balanceOf(writer)).toString()
    //    let purchaser_dai = (await dai.balanceOf(purchaser)).toString()
    //    console.log('omn Dai: ', omn_dai)
    //    console.log('Writer Dai: ', writer_dai)
    //    console.log('Purchaser Dai: ', purchaser_dai)
    //    console.log(gas)
    //});


})