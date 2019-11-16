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
    var premium = (1*decimals).toFixed() // premium that a seller asks for
    var amount = (5*decimals).toFixed()


    console.log('Strike: ', strike,'Underlying: ', underlying)

    async function getGas(func, name) {
        let spent = await func.receipt.gasUsed
        gas.push([name + ' gas: ', spent])
    }

    async function checkBalances(){
        console.log(' * ETH Balances of Users * ')
        var bal_before = [
            'Writer ETH: ',
            'Purchaser ETH: ',
        ]
        var acc_list = [
            writer,
            purchaser,
        ]
        for(var i = 0; i < acc_list.length; i++) {
            console.log(bal_before[i], await web3.eth.getBalance(acc_list[i])/10**18)
        }
    }

    async function tokenBalances(omn_address, oat, dai, stash40, slate40, _omn) {
        console.log(' * Ledger Balances * ')
        // Balances of Stash/Slate
        let stash_bal = (await oat.balanceOf(stash40.address)).toString()
        console.log('Stash Oat: ', stash_bal)
        let slate_dai = (await dai.balanceOf(slate40.address)).toString()
        console.log('Slate Dai: ', slate_dai)

        // oat balances of users
        let omn_oat = (await oat.balanceOf(omn_address)).toString()
        let writer_oat = (await oat.balanceOf(writer)).toString()
        let purchaser_oat = (await oat.balanceOf(purchaser)).toString()
        console.log('Omn oat: ', omn_oat)
        console.log('Writer oat: ', writer_oat)
        console.log('Purchaser oat: ', purchaser_oat)

        // dai balances of users
        let omn_dai = (await dai.balanceOf(omn_address)).toString()
        let writer_dai = (await dai.balanceOf(writer)).toString()
        let purchaser_dai = (await dai.balanceOf(purchaser)).toString()
        console.log('Omn dai: ', omn_dai)
        console.log('Writer dai: ', writer_dai)
        console.log('Purchaser dai: ', purchaser_dai)

        // OMN token Balances
        let writer__omn = (await _omn.balanceOf(writer)).toString()
        let purchaser__omn = (await _omn.balanceOf(purchaser)).toString()
        console.log('Writer _omn: ', writer__omn)
        console.log('Purchaser _omn: ', purchaser__omn)

        // OMN Total Supply
        let total = (await _omn.totalSupply()).toString()
        console.log('Total OMN Supply: ', total)
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
        await tokenBalances(omn_address, oat, dai, stash40, slate40, _omn)
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
        console.log('Stash40 Before Write: ', stash_bal_prior)

        // Write function
        //console.log('underlying Deposited: ', underlying)
        //let approve = await oat.approve(omn_address, underlying)
        //let write = await _omn.write(underlying, {from: writer})

        var more = (12*10**18).toFixed()
        console.log('underlying Deposited: ', more)
        let approve = await oat.approve(omn_address, more)
        let write = await _omn.write(more, {from: writer})
        
        // Get gas usage
        let write_gas = await write.receipt.gasUsed
        console.log('write Gas Internal: ', write_gas)
        await getGas(write, 'write internal')

        // Confirm writer is writer of contract
        let wrote = await stash40.wrote(omn_address)
        console.log('Wrote: ', wrote)
        assert.equal(wrote, writer, 'Should be writer writing')

        // Confirm funds deposited, can be removed because this is for cash settled
        //let fund = await stash40.fund(writer)
        //console.log('Funded Amount: ', (fund).toString())
        //assert.strictEqual((fund).toString(), underlying.toString(), 'Writer should have funded Stash40')

        let fund = await stash40.fund(writer)
        console.log('Funded Amount: ', (fund).toString())
        assert.strictEqual((fund).toString(), more.toString(), 'Writer should have funded Stash40')

        // Get Balances of Accts
        console.log('Should have transferred underlying: ' + underlying.toString() + ' to Stash40')
        await tokenBalances(omn_address, oat, dai, stash40, slate40, _omn)

        // Sell Function
        let writer_bal = await _omn.balanceOf(writer)
        await oat.approve(omn_address, writer_bal)
        let sell = await _omn.sell(writer_bal, premium, {from: writer}) // Sell the option token for premium

        await checkBalances()
        await tokenBalances(omn_address, oat, dai, stash40, slate40, _omn)
    });

    it('Purchase Function Test', async () => {
        console.log(' *** Purchases ***')
        // Get instances
        let dai = await Dai.deployed()
        let oat = await Oat.deployed()
        let omn_fac = await Factory.deployed()
        let omn_address = await omn_fac.getOmn(writer)
        let _omn = await Omn.at(omn_address)
        let slate40 = await Slate40.deployed()
        let stash40 = await Stash40.deployed()
        
        // Get Ether Bal of Writer Before
        console.log('Writer Ether Bal: ', (await web3.eth.getBalance(writer))/decimals)

        // Purchase function, should pay premium
        let purchase = await _omn.purchase(amount, {from: purchaser, value: premium*5 })
        
        // Get gas usage
        let purchase_gas = await purchase.receipt.gasUsed
        console.log('purchase Gas Internal: ', purchase_gas)
        await getGas(purchase, 'purchase internal')

        // Confirms purchase
        let bought = await slate40.bought(omn_address)
        console.log('Bought: ', bought)
        assert.equal(bought, purchaser, 'Should be purchaser purchasing')

        // Confirms premium was paid
        //let prm = await slate40.premium(purchaser)
        //console.log('Premium: ', prm.toString())
        //assert.strictEqual(prm.toString(), premium, 'purchaser should have paid premium')

        // Checks balances
        console.log('Should have transferred premium: ' + premium.toString() + ' to Writer')
        console.log('Writer Ether Bal: ', (await web3.eth.getBalance(writer))/decimals)
        await checkBalances()
        await tokenBalances(omn_address, oat, dai, stash40, slate40, _omn)
    });

    it('omn Maturity', async () => {
        console.log('\n')
        let dai = await Dai.deployed()
        let omn_fac = await Factory.deployed()
        let omn_address = await omn_fac.getOmn(writer)
        let _omn = await Omn.at(omn_address)
        let slate40 = await Slate40.deployed()
        let stash40 = await Stash40.deployed()
        let wax = await Wax.deployed()
        
        let mature = await _omn.isMature()
        

        let timestamp = (await _omn.expiration())
        console.log('Expiration timestamp: ', (timestamp.toNumber()))
    });

    it('omn Exercise', async () => {
        // Get contract instances
        console.log('\n')
        let oat = await Oat.deployed()
        let dai = await Dai.deployed()
        let omn_fac = await Factory.deployed()
        let omn_address = await omn_fac.getOmn(writer)
        let _omn = await Omn.at(omn_address)
        let slate40 = await Slate40.deployed()
        let stash40 = await Stash40.deployed()

        // Exercise comes from buyer, where they pay for the underlying at the strike price (in wei)
        let amount_to_exercise = 2
        let approve = await dai.approve(omn_address, (strike * 1 * amount_to_exercise).toString(), {from: purchaser})
        let exercise = await _omn.exercise(amount_to_exercise, {from: purchaser})
        
        // Get gas usage
        let exercise_gas = await exercise.receipt.gasUsed
        console.log('exercise Gas Internal: ', exercise_gas)
        await getGas(exercise, 'exercise')
        
        // Get balances of users
        await checkBalances()
        await tokenBalances(omn_address, oat, dai, stash40, slate40, _omn)
        console.log(gas)
    });


})