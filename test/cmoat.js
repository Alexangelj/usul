const assert = require('assert').strict;
const Factory = artifacts.require('Factory')
const Wax = artifacts.require('Wax')
const Stk = artifacts.require('STK')
const Udr = artifacts.require('UDR')
const cMoat = artifacts.require('cMoat')

cMoat('cMoat', accounts => {

    // ** Description **
    // Purchaser will have STK to purchase the underlying
    // Writer will have UDR to underwrite

    var writer = accounts[0]
    var purchaser = accounts[1]
    var writer2 = accounts[2]
    var purchaser2 = accounts[3]
    var writer3 = accounts[4]
    var purchaser3 = accounts[5]
    var decimals = 10**18
    var gas = []
    var strike = (10*decimals).toFixed() // STK amount paid for underlying
    var underlying = (2*decimals).toFixed() // UDR amount sold for strike asset
    var maturity = 1577678400 // valid 11/17/2019 12pm utc
    var premium = (1*decimals).toFixed() // premium that a seller asks for
    var amount = (3*decimals).toFixed()
    var type = 'C'


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

    async function tokenBalances(cMoat_address, UDR, STK, _cMoat) {
        console.log(' * Ledger Balances * ')

        // UDR balances of users
        let cMoat_UDR = ((await UDR.balanceOf(cMoat_address))/decimals).toString()
        let writer_UDR = ((await UDR.balanceOf(writer))/decimals).toString()
        let purchaser_UDR = ((await UDR.balanceOf(purchaser))/decimals).toString()
        let account2_UDR = ((await UDR.balanceOf(writer2))/decimals).toString()
        let account3_UDR = ((await UDR.balanceOf(purchaser2))/decimals).toString()
        console.log('cMoat UDR: ', cMoat_UDR)
        console.log('Writer UDR: ', writer_UDR)
        console.log('Purchaser UDR: ', purchaser_UDR)
        console.log('Accounts 2 UDR: ', account2_UDR)
        console.log('Accounts 3 UDR: ', account3_UDR)

        // STK balances of users
        let cMoat_STK = ((await STK.balanceOf(cMoat_address))/decimals).toString()
        let writer_STK = ((await STK.balanceOf(writer))/decimals).toString()
        let purchaser_STK = ((await STK.balanceOf(purchaser))/decimals).toString()
        let account2_STK = ((await STK.balanceOf(writer2))/decimals).toString()
        let account3_STK = ((await STK.balanceOf(purchaser2))/decimals).toString()
        console.log('cMoat STK: ', cMoat_STK)
        console.log('Writer STK: ', writer_STK)
        console.log('Purchaser STK: ', purchaser_STK)
        console.log('Accounts 2 STK: ', account2_STK)
        console.log('Accounts 3 STK: ', account3_STK)

        // cMoat token Balances
        let cMoat__cMoat = ((await _cMoat.balanceOf(_cMoat.address))/decimals).toString()
        let writer__cMoat = ((await _cMoat.balanceOf(writer))/decimals).toString()
        let purchaser__cMoat = ((await _cMoat.balanceOf(purchaser))/decimals).toString()
        let account2__cMoat = ((await _cMoat.balanceOf(writer2))/decimals).toString()
        let account3__cMoat = ((await _cMoat.balanceOf(purchaser2))/decimals).toString()
        console.log('cMoat _cMoat: ', cMoat__cMoat)
        console.log('Writer _cMoat: ', writer__cMoat)
        console.log('Purchaser _cMoat: ', purchaser__cMoat)
        console.log('Accounts 2 cMoat: ', account2__cMoat)
        console.log('Accounts 3 cMoat: ', account3__cMoat)

        // cMoat Total Supply
        let total = ((await _cMoat.totalSupply())/decimals).toString()
        console.log('Total cMoat Supply: ', total)
    }

    it('Creates cMoat cMoat', async () => {
        console.log('\n')
        let cMoat_fac = await Factory.deployed()
        let cMoat = await cMoat_fac.createcMoat(  strike, 
                                            underlying, 
                                            maturity,
                                            'cMoat=STK/UDR C for 10S 2U Dec 30 2019',
                                            ((await STK.symbol()) + (await UDR.symbol()) + (maturity).toString() + type + (strike * 1 / decimals) + 'S' + (underlying * 1 / decimals) + 'U').toString()
                                            )
        
        // Get gas usage
        let cMoat_gas = await cMoat.receipt.gasUsed
        console.log('cMoat Gas Internal: ', cMoat_gas)
        await getGas(cMoat, 'cMoat internal')

        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()
        let cMoat_address = await cMoat_fac.getcMoat(writer)
        let _cMoat = await cMoat.at(cMoat_address)
        await tokenBalances(cMoat_address, UDR, STK, _cMoat)
        console.log(' *** End cMoat Create *** ')
    });

    it('Write Function Test', async () => {
        console.log(' *** Writes ***')
        // ** Description **
        // Writer is going to provide underlying asset (UDR) in this case to cMoat
        
        // Get instances

        // Tokens
        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()
        // Options cMoats
        let cMoat_fac = await Factory.deployed()
        let cMoat_address = await cMoat_fac.getcMoat(writer)
        let _cMoat = await cMoat.at(cMoat_address)

        var more = (12*10**18).toFixed()
        console.log('underlying Deposited: ', more)
        let approve = await UDR.approve(cMoat_address, more)
        let write = await _cMoat.write(more, {from: writer})

        let tx = await UDR.transfer(writer2, more)
        let approve2 = await UDR.approve(cMoat_address, more, {from: writer2})
        let write2 = await _cMoat.write(more, {from: writer2})

        let tx2 = await UDR.transfer(writer3, more)
        let approve3 = await UDR.approve(cMoat_address, more, {from: writer3})
        let write3 = await _cMoat.write(more, {from: writer3})
        
        
        // Get gas usage
        let write_gas = await write.receipt.gasUsed
        console.log('write Gas Internal: ', write_gas)
        await getGas(write, 'write internal')

        // Get Balances of Accts
        console.log('Should have transferred underlying: ' + underlying.toString() + ' to cMoat')
        await tokenBalances(cMoat_address, UDR, STK, _cMoat)

        // Sell Function
        let writer_bal = await _cMoat.balanceOf(writer)
        await UDR.approve(cMoat_address, writer_bal)
        //let sell = await _cMoat.sell(writer_bal, premium, {from: writer}) // Sell the option token for premium

        await checkBalances()
        await tokenBalances(cMoat_address, UDR, STK, _cMoat)
        let book = await _cMoat.lockBook__locks__user(1)
        console.log(book)
    });

    it('Purchase Function Test', async () => {
        console.log(' *** Purchases ***')
        // Get instances
        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()
        let cMoat_fac = await Factory.deployed()
        let cMoat_address = await cMoat_fac.getcMoat(writer)
        let _cMoat = await cMoat.at(cMoat_address)
        
        // Get Ether Bal of Writer Before
        console.log('Writer Ether Bal: ', (await web3.eth.getBalance(writer))/decimals)


        // Instead of purchase function we can just directly sell the tokens to the buyer
        let sale = _cMoat.transfer(purchaser, amount)
        let sale2 = _cMoat.transfer(purchaser2, amount, {from: writer2})
        let sale3 = _cMoat.transfer(purchaser2, amount, {from: writer2})
        let sale4 = _cMoat.transfer(purchaser2, amount, {from: writer3})
        let sale5 = _cMoat.transfer(purchaser2, amount, {from: writer3})


        // Checks balances
        console.log('Should have transferred premium: ' + premium.toString() + ' to Writer')
        console.log('Writer Ether Bal: ', (await web3.eth.getBalance(writer))/decimals)
        await checkBalances()
        await tokenBalances(cMoat_address, UDR, STK, _cMoat)
    });

    it('cMoat Maturity', async () => {
        console.log('\n')
        let STK = await Stk.deployed()
        let cMoat_fac = await Factory.deployed()
        let cMoat_address = await cMoat_fac.getcMoat(writer)
        let _cMoat = await cMoat.at(cMoat_address)
        let wax = await Wax.deployed()
        
        let mature = await _cMoat.isMature()

        let timestamp = (await _cMoat.maturity())
        console.log('Expiration timestamp: ', (timestamp.toNumber()))
    });
    
    it('cMoat close', async () => {
        // Get cMoat instances
        console.log('\n')
        let UDR = await Udr.deployed()
        let STK = await Stk.deployed()
        let cMoat_fac = await Factory.deployed()
        let cMoat_address = await cMoat_fac.getcMoat(writer)
        let _cMoat = await cMoat.at(cMoat_address)

        let amount_to_close = 2
        // close comes from buyer, where they pay for the underlying at the strike price (in wei)
        let close = await _cMoat.close((amount_to_close*decimals).toFixed(), {from: writer})
        
        // Get gas usage
        let close_gas = await close.receipt.gasUsed
        console.log('close Gas Internal: ', close_gas)
        await getGas(close, 'close')
        
        for(var i = 0; i < 5; i++){
            console.log(((i).toString() + ': '), ((await _cMoat.lockBook__locks__user(i))).toString(), ((await _cMoat.lockBook__locks__underlying_amount(i))/decimals).toString())
        }

        // Get balances of users
        await checkBalances()
        await tokenBalances(cMoat_address, UDR, STK, _cMoat)
        console.log(gas)
    });
    
    it('cMoat Exercise', async () => {
        // Get cMoat instances
        console.log('\n')
        let UDR = await Udr.deployed()
        let STK = await Stk.deployed()
        let cMoat_fac = await Factory.deployed()
        let cMoat_address = await cMoat_fac.getcMoat(writer)
        let _cMoat = await cMoat.at(cMoat_address)

        // Exercise comes from buyer, where they pay for the underlying at the strike price (in wei)
        let amount_to_exercise = 2
        let approve = await STK.approve(cMoat_address, (strike * 1 * amount_to_exercise).toString(), {from: purchaser})
        let exercise = await _cMoat.exercise((amount_to_exercise*decimals).toFixed(), {from: purchaser})
        //console.log((exercise.receipt.logs[2].args.amount).toString())
        let amount_to_exercise2 = 9
        let tx = await STK.transfer(purchaser2, (10**20).toFixed(), {from: purchaser})
        let approve2 = await STK.approve(cMoat_address, (strike * 1 * amount_to_exercise2).toString(), {from: purchaser2})
        let exercise2 = await _cMoat.exercise((amount_to_exercise2*decimals).toFixed(), {from: purchaser2})
        
        // Get gas usage
        let exercise_gas = await exercise.receipt.gasUsed
        console.log('exercise Gas Internal: ', exercise_gas)
        await getGas(exercise, 'exercise')
        
        for(var i = 0; i < 5; i++){
            console.log(((i).toString() + ': '), ((await _cMoat.lockBook__locks__user(i))).toString(), ((await _cMoat.lockBook__locks__underlying_amount(i))/decimals).toString())
        }

        // Get balances of users
        await checkBalances()
        await tokenBalances(cMoat_address, UDR, STK, _cMoat)
        console.log(gas)
        
    });

    it('cMoat expire', async () => {
        // Get cMoat instances
        console.log('\n')
        let UDR = await Udr.deployed()
        let STK = await Stk.deployed()
        let cMoat_fac = await Factory.deployed()
        let cMoat_address = await cMoat_fac.getcMoat(writer)
        let _cMoat = await cMoat.at(cMoat_address)

        

        // close all cMoats
        let expire = await _cMoat.expire()
        
        // Get gas usage
        let expire_gas = await expire.receipt.gasUsed
        console.log('expire Gas Internal: ', expire_gas)
        await getGas(expire, 'expire')
        
        for(var i = 0; i < 5; i++){
            console.log(((i).toString() + ': '), ((await _cMoat.lockBook__locks__user(i))).toString(), ((await _cMoat.lockBook__locks__underlying_amount(i))/decimals).toString())
        }
        
        // Get balances of users
        await checkBalances()
        await tokenBalances(cMoat_address, UDR, STK, _cMoat)
        console.log(gas)
        console.log(await _zod.name())
    });

})