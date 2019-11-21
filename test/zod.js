const assert = require('assert').strict;
const Factory = artifacts.require('Factory')
const Wax = artifacts.require('Wax')
const Dai = artifacts.require('Dai')
const Oat = artifacts.require('Oat')
const Zod = artifacts.require('Zod')

contract('zod', accounts => {

    // ** Description **
    // Purchaser will have dai to purchase the underlying
    // Writer will have oat to underwrite

    var writer = accounts[0]
    var purchaser = accounts[1]
    var writer2 = accounts[2]
    var purchaser2 = accounts[3]
    var writer3 = accounts[4]
    var purchaser3 = accounts[5]
    var decimals = 10**18
    var gas = []
    var strike = (10*decimals).toFixed() // Dai amount paid for underlying
    var underlying = (2*decimals).toFixed() // Oat amount sold for strike asset
    var maturity = 1573992000 // valid 11/17/2019 12pm utc
    var premium = (1*decimals).toFixed() // premium that a seller asks for
    var amount = (1*decimals).toFixed()


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

    async function tokenBalances(zod_address, oat, dai, _zod) {
        console.log(' * Ledger Balances * ')

        // oat balances of users
        let zod_oat = ((await oat.balanceOf(zod_address))/decimals).toString()
        let writer_oat = ((await oat.balanceOf(writer))/decimals).toString()
        let purchaser_oat = ((await oat.balanceOf(purchaser))/decimals).toString()
        let account2_oat = ((await oat.balanceOf(writer2))/decimals).toString()
        let account3_oat = ((await oat.balanceOf(purchaser2))/decimals).toString()
        let account4_oat = ((await oat.balanceOf(writer3))/decimals).toString()
        let account5_oat = ((await oat.balanceOf(purchaser3))/decimals).toString()
        console.log('zod oat: ', zod_oat)
        console.log('Writer oat: ', writer_oat)
        console.log('Purchaser oat: ', purchaser_oat)
        console.log('Writer 2 oat: ', account2_oat)
        console.log('Purchaser 2 oat: ', account3_oat)
        console.log('Writer 3 oat: ', account4_oat)
        console.log('Purchaser 3 oat: ', account5_oat)

        // dai balances of users
        let zod_dai = ((await dai.balanceOf(zod_address))/decimals).toString()
        let writer_dai = ((await dai.balanceOf(writer))/decimals).toString()
        let purchaser_dai = ((await dai.balanceOf(purchaser))/decimals).toString()
        let account2_dai = ((await dai.balanceOf(writer2))/decimals).toString()
        let account3_dai = ((await dai.balanceOf(purchaser2))/decimals).toString()
        let account4_dai = ((await dai.balanceOf(writer3))/decimals).toString()
        let account5_dai = ((await dai.balanceOf(purchaser3))/decimals).toString()
        console.log('zod dai: ', zod_dai)
        console.log('Writer dai: ', writer_dai)
        console.log('Purchaser dai: ', purchaser_dai)
        console.log('Writer 2 dai: ', account2_dai)
        console.log('Purchaser 2 dai: ', account3_dai)
        console.log('Writer 3 dai: ', account4_dai)
        console.log('Purchaser 3 dai: ', account5_dai)

        // zod token Balances
        let zod__zod = ((await _zod.balanceOf(_zod.address))/decimals).toString()
        let writer__zod = ((await _zod.balanceOf(writer))/decimals).toString()
        let purchaser__zod = ((await _zod.balanceOf(purchaser))/decimals).toString()
        let account2__zod = ((await _zod.balanceOf(writer2))/decimals).toString()
        let account3__zod = ((await _zod.balanceOf(purchaser2))/decimals).toString()
        let account4_zod = ((await _zod.balanceOf(writer3))/decimals).toString()
        let account5_zod = ((await _zod.balanceOf(purchaser3))/decimals).toString()
        console.log('zod _zod: ', zod__zod)
        console.log('Writer _zod: ', writer__zod)
        console.log('Purchaser _zod: ', purchaser__zod)
        console.log('Writer 2 zod: ', account2__zod)
        console.log('Purchaser 2 zod: ', account3__zod)
        console.log('Writer 3 zod: ', account4_zod)
        console.log('Purchaser 3 zod: ', account5_zod)

        // zod Total Supply
        let total = ((await _zod.totalSupply())/decimals).toString()
        console.log('Total zod Supply: ', total)
    }

    it('Creates zod Contract', async () => {
        console.log('\n')
        let zod_fac = await Factory.deployed()
        let zod = await zod_fac.createZod(  strike, 
                                            underlying, 
                                            maturity,
                                            )
        
        // Get gas usage
        let zod_gas = await zod.receipt.gasUsed
        console.log('zod Gas Internal: ', zod_gas)
        await getGas(zod, 'zod internal')
        console.log(' *** End zod Create *** ')
    });

    it('Write Function Test', async () => {
        console.log(' *** Writes *** ')
        // ** Description **
        // Writer is going to provide strike asset (dai) in this case to contract

        // Tokens
        let dai = await Dai.deployed()
        let oat = await Oat.deployed()
        // Options contracts
        let zod_fac = await Factory.deployed()
        let zod_address = await zod_fac.getContract(writer)
        let _zod = await Zod.at(zod_address)

        var more = (30*10**18).toFixed()
        console.log('underlying Deposited: ', more)
        let tx = await dai.transfer(writer, more, {from: purchaser})
        let approve = await dai.approve(zod_address, more, {from: writer})
        let write = await _zod.write(more, {from: writer})

        let tx1 = await dai.transfer(writer2, more, {from: purchaser})
        let approve2 = await dai.approve(zod_address, more, {from: writer2})
        let write2 = await _zod.write(more, {from: writer2})

        let tx2 = await dai.transfer(writer3, more, {from: purchaser})
        let approve3 = await dai.approve(zod_address, more, {from: writer3})
        let write3 = await _zod.write(more, {from: writer3})
        
        
        // Get gas usage
        let write_gas = await write.receipt.gasUsed
        console.log('write Gas Internal: ', write_gas)
        await getGas(write, 'write internal')

        // Get Balances
        await checkBalances()
        await tokenBalances(zod_address, oat, dai, _zod)
        let book = await _zod.lockBook__locks__strike_amount(1)
        console.log('book: ', book.toString())
    });

    it('Purchase Function Test', async () => {
        console.log(' *** Purchases *** ')
        // Get instances
        let dai = await Dai.deployed()
        let oat = await Oat.deployed()
        let zod_fac = await Factory.deployed()
        let zod_address = await zod_fac.getContract(writer)
        let _zod = await Zod.at(zod_address)

        // Instead of purchase function we can just directly sell the tokens to the buyer
        let sale = _zod.transfer(purchaser, amount)
        let sale2 = _zod.transfer(purchaser2, amount, {from: writer2})
        let sale3 = _zod.transfer(purchaser2, amount, {from: writer2})
        let sale4 = _zod.transfer(purchaser2, amount, {from: writer3})
        let sale5 = _zod.transfer(purchaser2, amount, {from: writer3})
        let sale6 = _zod.transfer(purchaser2, amount, {from: writer3})

        // Checks balances
        await checkBalances()
        await tokenBalances(zod_address, oat, dai, _zod)
    });

    it('zod Maturity', async () => {
        console.log('\n')
        let dai = await Dai.deployed()
        let zod_fac = await Factory.deployed()
        let zod_address = await zod_fac.getContract(writer)
        let _zod = await Zod.at(zod_address)
        let wax = await Wax.deployed()
        
        let mature = await _zod.isMature()

        let timestamp = (await _zod.maturity())
        console.log('Expiration timestamp: ', (timestamp.toNumber()))
    });
    
    it('zod close', async () => {
        // Get contract instances
        console.log('\n')
        let oat = await Oat.deployed()
        let dai = await Dai.deployed()
        let zod_fac = await Factory.deployed()
        let zod_address = await zod_fac.getContract(writer)
        let _zod = await Zod.at(zod_address)

        let amount_to_close = 2
        // A writer can close to burn their option tokens and redeem their deposit
        let close = await _zod.close((amount_to_close*decimals).toFixed(), {from: writer})
        
        // Get gas usage
        let close_gas = await close.receipt.gasUsed
        console.log('close Gas Internal: ', close_gas)
        await getGas(close, 'close')
        
        // Get balances of users
        await checkBalances()
        await tokenBalances(zod_address, oat, dai, _zod)
        console.log(gas)
    });
    
    it('zod Exercise', async () => {
        // Get contract instances
        console.log('\n')
        let oat = await Oat.deployed()
        let dai = await Dai.deployed()
        let zod_fac = await Factory.deployed()
        let zod_address = await zod_fac.getContract(writer)
        let _zod = await Zod.at(zod_address)

        // Strike Amounts underwritten
        for(var i = 0; i < 5; i++){
            console.log(((i).toString() + ': '), ((await _zod.lockBook__locks__user(i))).toString(), ((await _zod.lockBook__locks__strike_amount(i))/decimals).toString())
        }

        // Exercise comes from buyer, where they sell the underlying asset for the strike price
        let amount_to_exercise = 1
        let tx = await oat.transfer(purchaser, (10**20).toFixed(), {from: writer})
        let approve = await oat.approve(zod_address, (underlying * 1 * amount_to_exercise).toString(), {from: purchaser})
        let exercise = await _zod.exercise((amount_to_exercise*decimals).toFixed(), {from: purchaser})

        let amount_to_exercise2 = 5
        let tx1 = await oat.transfer(purchaser2, (10**20).toFixed(), {from: writer})
        let approve2 = await oat.approve(zod_address, (underlying * 1 * amount_to_exercise2).toString(), {from: purchaser2})
        let exercise2 = await _zod.exercise((amount_to_exercise2*decimals).toFixed(), {from: purchaser2})
        
        // Get gas usage
        let exercise_gas = await exercise.receipt.gasUsed
        console.log('exercise Gas Internal: ', exercise_gas)
        await getGas(exercise, 'exercise')
        
        // Strike Amounts underwritten
        for(var i = 0; i < 5; i++){
            console.log(((i).toString() + ': '), ((await _zod.lockBook__locks__user(i))).toString(), ((await _zod.lockBook__locks__strike_amount(i))/decimals).toString())
        }

        // Get balances of users
        await checkBalances()
        await tokenBalances(zod_address, oat, dai, _zod)
        console.log(gas)
    });

    it('zod expire', async () => {
        // Get contract instances
        console.log('\n')
        let oat = await Oat.deployed()
        let dai = await Dai.deployed()
        let zod_fac = await Factory.deployed()
        let zod_address = await zod_fac.getContract(writer)
        let _zod = await Zod.at(zod_address)

        

        // close all contracts
        let expire = await _zod.expire()
        
        // Get gas usage
        let expire_gas = await expire.receipt.gasUsed
        console.log('expire Gas Internal: ', expire_gas)
        await getGas(expire, 'expire')
        
        for(var i = 0; i < 5; i++){
            console.log(((i).toString() + ': '), ((await _zod.lockBook__locks__user(i))).toString(), ((await _zod.lockBook__locks__strike_amount(i))/decimals).toString())
        }
        
        // Get balances of users
        await checkBalances()
        await tokenBalances(zod_address, oat, dai, _zod)
        console.log(gas)

        console.log(await expire.receipt.logs.length)
    });

})