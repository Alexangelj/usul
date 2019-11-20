const assert = require('assert').strict;
const Factory = artifacts.require('Factory')
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

    async function tokenBalances(doz_address, oat, dai, _doz) {
        console.log(' * Ledger Balances * ')

        // oat balances of users
        let doz_oat = ((await oat.balanceOf(doz_address))/decimals).toString()
        let writer_oat = ((await oat.balanceOf(writer))/decimals).toString()
        let purchaser_oat = ((await oat.balanceOf(purchaser))/decimals).toString()
        let account2_oat = ((await oat.balanceOf(writer2))/decimals).toString()
        let account3_oat = ((await oat.balanceOf(purchaser2))/decimals).toString()
        console.log('doz oat: ', doz_oat)
        console.log('Writer oat: ', writer_oat)
        console.log('Purchaser oat: ', purchaser_oat)
        console.log('Accounts 2 oat: ', account2_oat)
        console.log('Accounts 3 oat: ', account3_oat)

        // dai balances of users
        let doz_dai = ((await dai.balanceOf(doz_address))/decimals).toString()
        let writer_dai = ((await dai.balanceOf(writer))/decimals).toString()
        let purchaser_dai = ((await dai.balanceOf(purchaser))/decimals).toString()
        let account2_dai = ((await dai.balanceOf(writer2))/decimals).toString()
        let account3_dai = ((await dai.balanceOf(purchaser2))/decimals).toString()
        console.log('doz dai: ', doz_dai)
        console.log('Writer dai: ', writer_dai)
        console.log('Purchaser dai: ', purchaser_dai)
        console.log('Accounts 2 dai: ', account2_dai)
        console.log('Accounts 3 dai: ', account3_dai)

        // doz token Balances
        let doz__doz = ((await _doz.balanceOf(_doz.address))/decimals).toString()
        let writer__doz = ((await _doz.balanceOf(writer))/decimals).toString()
        let purchaser__doz = ((await _doz.balanceOf(purchaser))/decimals).toString()
        let account2__doz = ((await _doz.balanceOf(writer2))/decimals).toString()
        let account3__doz = ((await _doz.balanceOf(purchaser2))/decimals).toString()
        console.log('doz _doz: ', doz__doz)
        console.log('Writer _doz: ', writer__doz)
        console.log('Purchaser _doz: ', purchaser__doz)
        console.log('Accounts 2 doz: ', account2__doz)
        console.log('Accounts 3 doz: ', account3__doz)

        // doz Total Supply
        let total = ((await _doz.totalSupply())/decimals).toString()
        console.log('Total doz Supply: ', total)
    }

    it('Creates doz Contract', async () => {
        console.log('\n')
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
        let doz_address = await doz_fac.getContract(writer)
        let _doz = await Doz.at(doz_address)
        await tokenBalances(doz_address, oat, dai, _doz)
        console.log(' *** End doz Create *** ')
    });

    it('Write Function Test', async () => {
        console.log(' *** Writes ***')
        // ** Description **
        // Writer is going to provide underlying asset (oat) in this case to contract
        
        // Get instances

        // Tokens
        let dai = await Dai.deployed()
        let oat = await Oat.deployed()
        // Options contracts
        let doz_fac = await Factory.deployed()
        let doz_address = await doz_fac.getContract(writer)
        let _doz = await Doz.at(doz_address)

        var more = (12*10**18).toFixed()
        console.log('underlying Deposited: ', more)
        let approve = await oat.approve(doz_address, more)
        let write = await _doz.write(more, {from: writer})

        let tx = await oat.transfer(writer2, more)
        let approve2 = await oat.approve(doz_address, more, {from: writer2})
        let write2 = await _doz.write(more, {from: writer2})

        let tx2 = await oat.transfer(writer3, more)
        let approve3 = await oat.approve(doz_address, more, {from: writer3})
        let write3 = await _doz.write(more, {from: writer3})
        
        
        // Get gas usage
        let write_gas = await write.receipt.gasUsed
        console.log('write Gas Internal: ', write_gas)
        await getGas(write, 'write internal')

        // Get Balances of Accts
        console.log('Should have transferred underlying: ' + underlying.toString() + ' to Contract')
        await tokenBalances(doz_address, oat, dai, _doz)

        // Sell Function
        let writer_bal = await _doz.balanceOf(writer)
        await oat.approve(doz_address, writer_bal)
        //let sell = await _doz.sell(writer_bal, premium, {from: writer}) // Sell the option token for premium

        await checkBalances()
        await tokenBalances(doz_address, oat, dai, _doz)
        let book = await _doz.lockBook__locks__user(1)
        console.log(book)
    });

    it('Purchase Function Test', async () => {
        console.log(' *** Purchases ***')
        // Get instances
        let dai = await Dai.deployed()
        let oat = await Oat.deployed()
        let doz_fac = await Factory.deployed()
        let doz_address = await doz_fac.getContract(writer)
        let _doz = await Doz.at(doz_address)
        
        // Get Ether Bal of Writer Before
        console.log('Writer Ether Bal: ', (await web3.eth.getBalance(writer))/decimals)


        // Instead of purchase function we can just directly sell the tokens to the buyer
        let sale = _doz.transfer(purchaser, amount)
        let sale2 = _doz.transfer(purchaser2, amount, {from: writer2})
        let sale3 = _doz.transfer(purchaser2, amount, {from: writer2})
        let sale4 = _doz.transfer(purchaser2, amount, {from: writer3})
        let sale5 = _doz.transfer(purchaser2, amount, {from: writer3})


        // Checks balances
        console.log('Should have transferred premium: ' + premium.toString() + ' to Writer')
        console.log('Writer Ether Bal: ', (await web3.eth.getBalance(writer))/decimals)
        await checkBalances()
        await tokenBalances(doz_address, oat, dai, _doz)
    });

    it('doz Maturity', async () => {
        console.log('\n')
        let dai = await Dai.deployed()
        let doz_fac = await Factory.deployed()
        let doz_address = await doz_fac.getContract(writer)
        let _doz = await Doz.at(doz_address)
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
        let doz_address = await doz_fac.getContract(writer)
        let _doz = await Doz.at(doz_address)

        let amount_to_close = 2
        // close comes from buyer, where they pay for the underlying at the strike price (in wei)
        let close = await _doz.close((amount_to_close*decimals).toFixed(), {from: writer})
        
        // Get gas usage
        let close_gas = await close.receipt.gasUsed
        console.log('close Gas Internal: ', close_gas)
        await getGas(close, 'close')
        
        for(var i = 0; i < 5; i++){
            console.log(((i).toString() + ': '), ((await _doz.lockBook__locks__user(i))).toString(), ((await _doz.lockBook__locks__underlying_amount(i))/decimals).toString())
        }

        // Get balances of users
        await checkBalances()
        await tokenBalances(doz_address, oat, dai, _doz)
        console.log(gas)
    });
    
    it('doz Exercise', async () => {
        // Get contract instances
        console.log('\n')
        let oat = await Oat.deployed()
        let dai = await Dai.deployed()
        let doz_fac = await Factory.deployed()
        let doz_address = await doz_fac.getContract(writer)
        let _doz = await Doz.at(doz_address)

        // Exercise comes from buyer, where they pay for the underlying at the strike price (in wei)
        let amount_to_exercise = 2
        let approve = await dai.approve(doz_address, (strike * 1 * amount_to_exercise).toString(), {from: purchaser})
        let exercise = await _doz.exercise((amount_to_exercise*decimals).toFixed(), {from: purchaser})
        //console.log((exercise.receipt.logs[2].args.amount).toString())
        let amount_to_exercise2 = 9
        let tx = await dai.transfer(purchaser2, (10**20).toFixed(), {from: purchaser})
        let approve2 = await dai.approve(doz_address, (strike * 1 * amount_to_exercise2).toString(), {from: purchaser2})
        let exercise2 = await _doz.exercise((amount_to_exercise2*decimals).toFixed(), {from: purchaser2})
        
        // Get gas usage
        let exercise_gas = await exercise.receipt.gasUsed
        console.log('exercise Gas Internal: ', exercise_gas)
        await getGas(exercise, 'exercise')
        
        for(var i = 0; i < 5; i++){
            console.log(((i).toString() + ': '), ((await _doz.lockBook__locks__user(i))).toString(), ((await _doz.lockBook__locks__underlying_amount(i))/decimals).toString())
        }

        // Get balances of users
        await checkBalances()
        await tokenBalances(doz_address, oat, dai, _doz)
        console.log(gas)
        
    });

    it('doz expire', async () => {
        // Get contract instances
        console.log('\n')
        let oat = await Oat.deployed()
        let dai = await Dai.deployed()
        let doz_fac = await Factory.deployed()
        let doz_address = await doz_fac.getContract(writer)
        let _doz = await Doz.at(doz_address)

        

        // close all contracts
        let expire = await _doz.expire()
        
        // Get gas usage
        let expire_gas = await expire.receipt.gasUsed
        console.log('expire Gas Internal: ', expire_gas)
        await getGas(expire, 'expire')
        
        for(var i = 0; i < 5; i++){
            console.log(((i).toString() + ': '), ((await _doz.lockBook__locks__user(i))).toString(), ((await _doz.lockBook__locks__underlying_amount(i))/decimals).toString())
        }
        
        // Get balances of users
        await checkBalances()
        await tokenBalances(doz_address, oat, dai, _doz)
        console.log(gas)
    });

})