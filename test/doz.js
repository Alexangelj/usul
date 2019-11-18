const assert = require('assert').strict;
const Factory = artifacts.require('Factory')
const Slate40 = artifacts.require('Slate40')
const Stash40 = artifacts.require('Stash40')
const Wax = artifacts.require('Wax')
const Dai = artifacts.require('Dai')
const Oat = artifacts.require('Oat')
const Doz = artifacts.require('Doz')

contract('doz', accounts => {

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
    var amount = (3*decimals).toFixed()


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

    async function tokenBalances(doz_address, oat, dai, stash40, slate40, _doz) {
        console.log(' * Ledger Balances * ')
        // Balances of Stash/Slate
        let stash_bal = (await oat.balanceOf(stash40.address)).toString()
        console.log('Stash Oat: ', stash_bal)
        let slate_dai = (await dai.balanceOf(slate40.address)).toString()
        console.log('Slate Dai: ', slate_dai)

        // oat balances of users
        let doz_oat = (await oat.balanceOf(doz_address)).toString()
        let writer_oat = (await oat.balanceOf(writer)).toString()
        let purchaser_oat = (await oat.balanceOf(purchaser)).toString()
        console.log('doz oat: ', doz_oat)
        console.log('Writer oat: ', writer_oat)
        console.log('Purchaser oat: ', purchaser_oat)

        // dai balances of users
        let doz_dai = (await dai.balanceOf(doz_address)).toString()
        let writer_dai = (await dai.balanceOf(writer)).toString()
        let purchaser_dai = (await dai.balanceOf(purchaser)).toString()
        console.log('doz dai: ', doz_dai)
        console.log('Writer dai: ', writer_dai)
        console.log('Purchaser dai: ', purchaser_dai)

        // doz token Balances
        let doz__doz = (await _doz.balanceOf(_doz.address)).toString()
        let writer__doz = (await _doz.balanceOf(writer)).toString()
        let purchaser__doz = (await _doz.balanceOf(purchaser)).toString()
        console.log('doz _doz: ', doz__doz)
        console.log('Writer _doz: ', writer__doz)
        console.log('Purchaser _doz: ', purchaser__doz)

        // doz Total Supply
        let total = (await _doz.totalSupply()).toString()
        console.log('Total doz Supply: ', total)
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

    it('Creates doz Contract', async () => {
        console.log('\n')
        let slate40 = await Slate40.deployed()
        let stash40 = await Stash40.deployed()
        let doz_fac = await Factory.deployed()
        let doz = await doz_fac.createDoz(  strike, 
                                            underlying, 
                                            maturity,
                                            )
        
        // Get gas usage
        let doz_gas = await doz.receipt.gasUsed
        console.log('doz Gas Internal: ', doz_gas)
        await getGas(doz, 'doz internal')

        let dai = await Dai.deployed()
        let oat = await Oat.deployed()
        let doz_address = await doz_fac.getOmn(writer)
        let _doz = await Doz.at(doz_address)
        await tokenBalances(doz_address, oat, dai, stash40, slate40, _doz)
        console.log(' *** End doz Create *** ')
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
        let doz_fac = await Factory.deployed()
        let doz_address = await doz_fac.getOmn(writer)
        let _doz = await Doz.at(doz_address)
        // Auxillary storage
        let slate40 = await Slate40.deployed()
        let stash40 = await Stash40.deployed()

        // Get Oat Balance of Stash40
        //let dai_doz = await dai.transfer(doz_address, '100000000000000000000')
        let stash_bal_prior = (await oat.balanceOf(stash40.address)).toString()
        console.log('Stash40 Before Write: ', stash_bal_prior)

        // Write function
        //console.log('underlying Deposited: ', underlying)
        //let approve = await oat.approve(doz_address, underlying)
        //let write = await _doz.write(underlying, {from: writer})

        var more = (12*10**18).toFixed()
        console.log('underlying Deposited: ', more)
        let approve = await oat.approve(doz_address, more)
        let write = await _doz.write(more, {from: writer})
        
        // Get gas usage
        let write_gas = await write.receipt.gasUsed
        console.log('write Gas Internal: ', write_gas)
        await getGas(write, 'write internal')

        // Confirm writer is writer of contract
        let wrote_amount = (await _doz.writer_claim(writer)).toString()
        console.log('Wrote: ', wrote_amount)
        assert.equal(wrote_amount, more, 'Should be writer writing')

        // Confirm funds deposited, can be removed because this is for cash settled
        //let fund = await stash40.fund(writer)
        //console.log('Funded Amount: ', (fund).toString())
        //assert.strictEqual((fund).toString(), underlying.toString(), 'Writer should have funded Stash40')

        //let fund = await stash40.fund(writer)
        //console.log('Funded Amount: ', (fund).toString())
        //assert.strictEqual((fund).toString(), more.toString(), 'Writer should have funded Stash40')

        // Get Balances of Accts
        console.log('Should have transferred underlying: ' + underlying.toString() + ' to Stash40')
        await tokenBalances(doz_address, oat, dai, stash40, slate40, _doz)

        // Sell Function
        let writer_bal = await _doz.balanceOf(writer)
        await oat.approve(doz_address, writer_bal)
        //let sell = await _doz.sell(writer_bal, premium, {from: writer}) // Sell the option token for premium

        await checkBalances()
        await tokenBalances(doz_address, oat, dai, stash40, slate40, _doz)
    });

    it('Purchase Function Test', async () => {
        console.log(' *** Purchases ***')
        // Get instances
        let dai = await Dai.deployed()
        let oat = await Oat.deployed()
        let doz_fac = await Factory.deployed()
        let doz_address = await doz_fac.getOmn(writer)
        let _doz = await Doz.at(doz_address)
        let slate40 = await Slate40.deployed()
        let stash40 = await Stash40.deployed()
        
        // Get Ether Bal of Writer Before
        console.log('Writer Ether Bal: ', (await web3.eth.getBalance(writer))/decimals)


        // Instead of purchase function we can just directly sell the tokens to the buyer
        let sale = _doz.transfer(purchaser, amount)
        // Purchase function, should pay premium
        //let purchase = await _doz.purchase(amount, {from: purchaser, value: premium*3 })
        //
        //// Get gas usage
        //let purchase_gas = await purchase.receipt.gasUsed
        //console.log('purchase Gas Internal: ', purchase_gas)
        //await getGas(purchase, 'purchase internal')

        // Confirms purchase
        //let bought = await slate40.bought(doz_address)
        //console.log('Bought: ', bought)
        //assert.equal(bought, purchaser, 'Should be purchaser purchasing')

        // Confirms premium was paid
        //let prm = await slate40.premium(purchaser)
        //console.log('Premium: ', prm.toString())
        //assert.strictEqual(prm.toString(), premium, 'purchaser should have paid premium')

        // Checks balances
        console.log('Should have transferred premium: ' + premium.toString() + ' to Writer')
        console.log('Writer Ether Bal: ', (await web3.eth.getBalance(writer))/decimals)
        await checkBalances()
        await tokenBalances(doz_address, oat, dai, stash40, slate40, _doz)
    });

    it('doz Maturity', async () => {
        console.log('\n')
        let dai = await Dai.deployed()
        let doz_fac = await Factory.deployed()
        let doz_address = await doz_fac.getOmn(writer)
        let _doz = await Doz.at(doz_address)
        let slate40 = await Slate40.deployed()
        let stash40 = await Stash40.deployed()
        let wax = await Wax.deployed()
        
        let mature = await _doz.isMature()
        

        let timestamp = (await _doz.maturity())
        console.log('Expiration timestamp: ', (timestamp.toNumber()))
    });
    
    it('doz close', async () => {
        // Get contract instances
        console.log('\n')
        let oat = await Oat.deployed()
        let dai = await Dai.deployed()
        let doz_fac = await Factory.deployed()
        let doz_address = await doz_fac.getOmn(writer)
        let _doz = await Doz.at(doz_address)
        let slate40 = await Slate40.deployed()
        let stash40 = await Stash40.deployed()

        let amount_to_close = 2
        // Buy tokens back to close
        //let buy_to_close = await _doz.purchase((amount_to_close*decimals).toFixed(), {from: writer, value: premium*2})
        // close comes from buyer, where they pay for the underlying at the strike price (in wei)
        let close = await _doz.close((amount_to_close*decimals).toFixed(), {from: writer})
        
        // Get gas usage
        let close_gas = await close.receipt.gasUsed
        console.log('close Gas Internal: ', close_gas)
        await getGas(close, 'close')
        
        // Get balances of users
        await checkBalances()
        await tokenBalances(doz_address, oat, dai, stash40, slate40, _doz)
        console.log(gas)
    });
    
    it('doz Exercise', async () => {
        // Get contract instances
        console.log('\n')
        let oat = await Oat.deployed()
        let dai = await Dai.deployed()
        let doz_fac = await Factory.deployed()
        let doz_address = await doz_fac.getOmn(writer)
        let _doz = await Doz.at(doz_address)
        let slate40 = await Slate40.deployed()
        let stash40 = await Stash40.deployed()

        // Exercise comes from buyer, where they pay for the underlying at the strike price (in wei)
        let amount_to_exercise = 2
        let approve = await dai.approve(doz_address, (strike * 1 * amount_to_exercise).toString(), {from: purchaser})
        let exercise = await _doz.exercise(amount_to_exercise, {from: purchaser})
        
        // Get gas usage
        let exercise_gas = await exercise.receipt.gasUsed
        console.log('exercise Gas Internal: ', exercise_gas)
        await getGas(exercise, 'exercise')
        
        // Get balances of users
        await checkBalances()
        await tokenBalances(doz_address, oat, dai, stash40, slate40, _doz)
        console.log(gas)
    });


})