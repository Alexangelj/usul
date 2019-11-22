const assert = require('assert').strict;
const Factory = artifacts.require('Factory')
const Wax = artifacts.require('Wax')
const Stk = artifacts.require('STK')
const Udr = artifacts.require('UDR')
const pMoat = artifacts.require('pMoat')

contract('pMoat', accounts => {

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
    var maturity = 1577678400 // 12/30/2019 4 am
    var premium = (1*decimals).toFixed() // premium that a seller asks for
    var amount = (1*decimals).toFixed()
    var type = 'P'

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

    async function tokenBalances(pMoat_address, UDR, STK, _pMoat) {
        console.log(' * Ledger Balances * ')

        // UDR balances of users
        let pMoat_UDR = ((await UDR.balanceOf(pMoat_address))/decimals).toString()
        let writer_UDR = ((await UDR.balanceOf(writer))/decimals).toString()
        let purchaser_UDR = ((await UDR.balanceOf(purchaser))/decimals).toString()
        let account2_UDR = ((await UDR.balanceOf(writer2))/decimals).toString()
        let account3_UDR = ((await UDR.balanceOf(purchaser2))/decimals).toString()
        let account4_UDR = ((await UDR.balanceOf(writer3))/decimals).toString()
        let account5_UDR = ((await UDR.balanceOf(purchaser3))/decimals).toString()
        console.log('pMoat UDR: ', pMoat_UDR)
        console.log('Writer UDR: ', writer_UDR)
        console.log('Purchaser UDR: ', purchaser_UDR)
        console.log('Writer 2 UDR: ', account2_UDR)
        console.log('Purchaser 2 UDR: ', account3_UDR)
        console.log('Writer 3 UDR: ', account4_UDR)
        console.log('Purchaser 3 UDR: ', account5_UDR)

        // STK balances of users
        let pMoat_STK = ((await STK.balanceOf(pMoat_address))/decimals).toString()
        let writer_STK = ((await STK.balanceOf(writer))/decimals).toString()
        let purchaser_STK = ((await STK.balanceOf(purchaser))/decimals).toString()
        let account2_STK = ((await STK.balanceOf(writer2))/decimals).toString()
        let account3_STK = ((await STK.balanceOf(purchaser2))/decimals).toString()
        let account4_STK = ((await STK.balanceOf(writer3))/decimals).toString()
        let account5_STK = ((await STK.balanceOf(purchaser3))/decimals).toString()
        console.log('pMoat STK: ', pMoat_STK)
        console.log('Writer STK: ', writer_STK)
        console.log('Purchaser STK: ', purchaser_STK)
        console.log('Writer 2 STK: ', account2_STK)
        console.log('Purchaser 2 STK: ', account3_STK)
        console.log('Writer 3 STK: ', account4_STK)
        console.log('Purchaser 3 STK: ', account5_STK)

        // pMoat token Balances
        let pMoat__pMoat = ((await _pMoat.balanceOf(_pMoat.address))/decimals).toString()
        let writer__pMoat = ((await _pMoat.balanceOf(writer))/decimals).toString()
        let purchaser__pMoat = ((await _pMoat.balanceOf(purchaser))/decimals).toString()
        let account2__pMoat = ((await _pMoat.balanceOf(writer2))/decimals).toString()
        let account3__pMoat = ((await _pMoat.balanceOf(purchaser2))/decimals).toString()
        let account4_pMoat = ((await _pMoat.balanceOf(writer3))/decimals).toString()
        let account5_pMoat = ((await _pMoat.balanceOf(purchaser3))/decimals).toString()
        console.log('pMoat _pMoat: ', pMoat__pMoat)
        console.log('Writer _pMoat: ', writer__pMoat)
        console.log('Purchaser _pMoat: ', purchaser__pMoat)
        console.log('Writer 2 pMoat: ', account2__pMoat)
        console.log('Purchaser 2 pMoat: ', account3__pMoat)
        console.log('Writer 3 pMoat: ', account4_pMoat)
        console.log('Purchaser 3 pMoat: ', account5_pMoat)

        // pMoat Total Supply
        let total = ((await _pMoat.totalSupply())/decimals).toString()
        console.log('Total pMoat Supply: ', total)
    }

    it('Creates pMoat Contract', async () => {
        console.log('\n')
        // Tokens
        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()
        let pMoat_fac = await Factory.deployed()
        let pMoat = await pMoat_fac.createpMoat(strike, 
                                            underlying, 
                                            maturity,
                                            'pMoat=STK/UDR P for 10S 2U Dec 30 2019',
                                            ((await STK.symbol()) + (await UDR.symbol()) + (maturity).toString() + type + (strike * 1 / decimals) + 'S' + (underlying * 1 / decimals) + 'U').toString(),
                                            )
        
        // Get gas usage
        let pMoat_gas = await pMoat.receipt.gasUsed
        console.log('pMoat Gas Internal: ', pMoat_gas)
        await getGas(pMoat, 'pMoat internal')
        console.log(' *** End pMoat Create *** ')
    });

    it('Write Function Test', async () => {
        console.log(' *** Writes *** ')
        // ** Description **
        // Writer is going to provide strike asset (STK) in this case to contract

        // Tokens
        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()
        // Options contracts
        let pMoat_fac = await Factory.deployed()
        let pMoat_address = await pMoat_fac.getpMoat(writer)
        let _pMoat = await pMoat.at(pMoat_address)

        var more = (30*10**18).toFixed()
        console.log('underlying Deposited: ', more)
        let tx = await STK.transfer(writer, more, {from: purchaser})
        let approve = await STK.approve(pMoat_address, more, {from: writer})
        let write = await _pMoat.write(more, {from: writer})

        let tx1 = await STK.transfer(writer2, more, {from: purchaser})
        let approve2 = await STK.approve(pMoat_address, more, {from: writer2})
        let write2 = await _pMoat.write(more, {from: writer2})

        let tx2 = await STK.transfer(writer3, more, {from: purchaser})
        let approve3 = await STK.approve(pMoat_address, more, {from: writer3})
        let write3 = await _pMoat.write(more, {from: writer3})
        
        
        // Get gas usage
        let write_gas = await write.receipt.gasUsed
        console.log('write Gas Internal: ', write_gas)
        await getGas(write, 'write internal')

        // Get Balances
        await checkBalances()
        await tokenBalances(pMoat_address, UDR, STK, _pMoat)
        let book = await _pMoat.lockBook__locks__strike_amount(1)
        console.log('book: ', book.toString())
    });

    it('Purchase Function Test', async () => {
        console.log(' *** Purchases *** ')
        // Get instances
        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()
        let pMoat_fac = await Factory.deployed()
        let pMoat_address = await pMoat_fac.getpMoat(writer)
        let _pMoat = await pMoat.at(pMoat_address)

        // Instead of purchase function we can just directly sell the tokens to the buyer
        let sale = _pMoat.transfer(purchaser, amount)
        let sale2 = _pMoat.transfer(purchaser2, amount, {from: writer2})
        let sale3 = _pMoat.transfer(purchaser2, amount, {from: writer2})
        let sale4 = _pMoat.transfer(purchaser2, amount, {from: writer3})
        let sale5 = _pMoat.transfer(purchaser2, amount, {from: writer3})
        let sale6 = _pMoat.transfer(purchaser2, amount, {from: writer3})

        // Checks balances
        await checkBalances()
        await tokenBalances(pMoat_address, UDR, STK, _pMoat)
    });

    it('pMoat Maturity', async () => {
        console.log('\n')
        let STK = await Stk.deployed()
        let pMoat_fac = await Factory.deployed()
        let pMoat_address = await pMoat_fac.getpMoat(writer)
        let _pMoat = await pMoat.at(pMoat_address)
        let wax = await Wax.deployed()
        
        let mature = await _pMoat.isMature()

        let timestamp = (await _pMoat.maturity())
        console.log('Expiration timestamp: ', (timestamp.toNumber()))
    });
    
    it('pMoat close', async () => {
        // Get contract instances
        console.log('\n')
        let UDR = await Udr.deployed()
        let STK = await Stk.deployed()
        let pMoat_fac = await Factory.deployed()
        let pMoat_address = await pMoat_fac.getpMoat(writer)
        let _pMoat = await pMoat.at(pMoat_address)

        let amount_to_close = 2
        // A writer can close to burn their option tokens and redeem their deposit
        let close = await _pMoat.close((amount_to_close*decimals).toFixed(), {from: writer})
        
        // Get gas usage
        let close_gas = await close.receipt.gasUsed
        console.log('close Gas Internal: ', close_gas)
        await getGas(close, 'close')
        
        // Get balances of users
        await checkBalances()
        await tokenBalances(pMoat_address, UDR, STK, _pMoat)
        console.log(gas)
    });
    
    it('pMoat Exercise', async () => {
        // Get contract instances
        console.log('\n')
        let UDR = await Udr.deployed()
        let STK = await Stk.deployed()
        let pMoat_fac = await Factory.deployed()
        let pMoat_address = await pMoat_fac.getpMoat(writer)
        let _pMoat = await pMoat.at(pMoat_address)

        // Strike Amounts underwritten
        for(var i = 0; i < 5; i++){
            console.log(((i).toString() + ': '), ((await _pMoat.lockBook__locks__user(i))).toString(), ((await _pMoat.lockBook__locks__strike_amount(i))/decimals).toString())
        }

        // Exercise comes from buyer, where they sell the underlying asset for the strike price
        let amount_to_exercise = 1
        let tx = await UDR.transfer(purchaser, (10**20).toFixed(), {from: writer})
        let approve = await UDR.approve(pMoat_address, (underlying * 1 * amount_to_exercise).toString(), {from: purchaser})
        let exercise = await _pMoat.exercise((amount_to_exercise*decimals).toFixed(), {from: purchaser})

        let amount_to_exercise2 = 5
        let tx1 = await UDR.transfer(purchaser2, (10**20).toFixed(), {from: writer})
        let approve2 = await UDR.approve(pMoat_address, (underlying * 1 * amount_to_exercise2).toString(), {from: purchaser2})
        let exercise2 = await _pMoat.exercise((amount_to_exercise2*decimals).toFixed(), {from: purchaser2})
        
        // Get gas usage
        let exercise_gas = await exercise.receipt.gasUsed
        console.log('exercise Gas Internal: ', exercise_gas)
        await getGas(exercise, 'exercise')
        
        // Strike Amounts underwritten
        for(var i = 0; i < 5; i++){
            console.log(((i).toString() + ': '), ((await _pMoat.lockBook__locks__user(i))).toString(), ((await _pMoat.lockBook__locks__strike_amount(i))/decimals).toString())
        }

        // Get balances of users
        await checkBalances()
        await tokenBalances(pMoat_address, UDR, STK, _pMoat)
        console.log(gas)
    });

    it('pMoat expire', async () => {
        // Get contract instances
        console.log('\n')
        let UDR = await Udr.deployed()
        let STK = await Stk.deployed()
        let pMoat_fac = await Factory.deployed()
        let pMoat_address = await pMoat_fac.getpMoat(writer)
        let _pMoat = await pMoat.at(pMoat_address)

        

        // close all contracts
        let expire = await _pMoat.expire()
        
        // Get gas usage
        let expire_gas = await expire.receipt.gasUsed
        console.log('expire Gas Internal: ', expire_gas)
        await getGas(expire, 'expire')
        
        for(var i = 0; i < 5; i++){
            console.log(((i).toString() + ': '), ((await _pMoat.lockBook__locks__user(i))).toString(), ((await _pMoat.lockBook__locks__strike_amount(i))/decimals).toString())
        }
        
        // Get balances of users
        await checkBalances()
        await tokenBalances(pMoat_address, UDR, STK, _pMoat)
        console.log(gas)
        let bal = await _pMoat.balanceOf(writer, {from: writer})
        console.log(((bal).toString()) * 1)
        console.log(await _pMoat.symbol())
    });

})