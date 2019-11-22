/*
@title A full test which implements multiple parts, UDR, STK, cMoat, pMoat, and ODEX

@notice Sets up user's accounts on the ODEX, users can then buy, write, trade, exercise, and close the MUDRs

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
const Odex = artifacts.require('Odex')
var BN = require('bn.js')


contract('Full Test', accounts => {


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


    // Contract Parameters
    var strike = (12*10**18).toFixed() // Strike is 12 STK
    var underlying = (4*10**18).toFixed() // Underlying is 4 UDR
    var maturity = 1573992000
    var premium = (0.25*10**18).toFixed() // Premium price is 0.25 Ether
    var decimals = (10**18)
    var initial_tokens = '100000000000000000000000'

    // Parameters Array
    var par_ray = [
        ['Strike', strike],
        ['Underlying', underlying]
        ['Maturity', maturity],
        ['Premium', premium]
    ]


    let ledger = [
        // [Test Name, 'Alice', Account Address, Ether Balance, STK Balance, UDR Balance, cMoat Balance, pMoat Balance]
    ]

    let events = [
        // [per event [Test, Event, arg 1, arg 2, etc]]
    ]

    let dex_ledger = []

    let lock_book = []

    let per_book = []

    let gas = []

    let before_after = []

    let per_event = []


    // Functions 
    // Check All User Balances for All Tokens, Track Changes between Tests
    // Check Amount of gas used for each fuction call
    // Function to get All Events / Logs

    async function getLedger(test, STK, UDR, cMoat, pMoat) {
        /*
        @param test - string, name - string, address - address, ether - wei, STK -> pMoat contract instance
        */
        for(var i = 0; i < acc_ray.length; i++) { // For each account, append the ledger array with data
            let ether_bal = ((await web3.eth.getBalance(acc_ray[i][1]))).toString()
            let STK_bal = ((await STK.balanceOf(acc_ray[i][1]))).toString()
            let UDR_bal = ((await UDR.balanceOf(acc_ray[i][1]))).toString()
            let cMoat_bal = ((await cMoat.balanceOf(acc_ray[i][1]))).toString()
            let pMoat_bal = ((await pMoat.balanceOf(acc_ray[i][1]))).toString()
            ledger.push([test, acc_ray[i][0], acc_ray[i][1], ether_bal, STK_bal, UDR_bal, cMoat_bal, pMoat_bal])
        }
    }


    async function getDexLedger(test, STK, UDR, cMoat, pMoat, odex) {
        /*
        @param test - string, name - string, address - address, ether - wei, STK -> pMoat contract instance
        */
        for(var i = 0; i < acc_ray.length; i++) { // For each account, append the ledger array with data
            let ether_bal = (await odex.ethBalances(acc_ray[i][1])).toString()
            let STK_bal = ((await odex.getTokenBalance((await STK.symbol()).toString(), {from: acc_ray[i][1]}))).toString()
            let UDR_bal = ((await odex.getTokenBalance((await UDR.symbol()).toString(), {from: acc_ray[i][1]}))).toString()
            let cMoat_bal = ((await odex.getTokenBalance((await cMoat.symbol()).toString(), {from: acc_ray[i][1]}))).toString()
            let pMoat_bal = ((await odex.getTokenBalance((await pMoat.symbol()).toString(), {from: acc_ray[i][1]}))).toString()
            dex_ledger.push([test, acc_ray[i][0], acc_ray[i][1], ether_bal, STK_bal, UDR_bal, cMoat_bal, pMoat_bal])
        }
    }


    async function getGas(func, name) {
        let spent = await func.receipt.gasUsed
        gas.push([name + ' gas: ', spent])
    }


    async function getEvents(func, test) {
        for(var i = 0; i < func.receipt.logs.length; i++) { // For each log in event
            per_event.push(func.receipt.logs[i].event)
            for(x = 0; x < func.receipt.logs[i].args.__length__; x++) { // For each arg in event
                per_event.push((func.receipt.logs[i].args[x]).toString())
            }
        }
        events.push([test, per_event])
    }


    async function getLockBook(test, cMoat, pMoat) {
        let cMoat_book_len = await cMoat.lockBook__lock_length
        per_book.push('cMoat')
        for(var i = 0; i < 11; i++) {
            per_book.push((await cMoat.lockBook__locks__user(i)).toString(), (await cMoat.lockBook__locks__underlying_amount(i)).toString())
        }
        per_book.push('pMoat')
        let pMoat_book_len = await pMoat.lockBook__lock_length
        for(var i = 0; i < 11; i++) {
            per_book.push((await pMoat.lockBook__locks__user(i)).toString(), (await pMoat.lockBook__locks__strike_amount(i)).toString())
        }
        lock_book.push([test, per_book])
    }

/*
@notice These are the tests which we will run to push the limits of the contracts

Each of the 9 users will recieve 100,000 of the Underlying and Asset tokens.
They will then purchase, write, exercise, and close cMoat and pMoat MUDRs

There is a function that manages the transfers and it will operate for 100 tx before it ends the test.

*/


    it('Initialize Token Contracts and Disperse Funds', async () => {
        console.log('\n')
        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()

        /* 
            Initial Transfer 
            Alice has the initial UDR
            Bob has the initial STK 
        */


        // Transfer
        for(var i = 0; i < acc_ray.length; i++) { // For each account
            await STK.transfer(acc_ray[i][1], initial_tokens, {from: Bob})
            await UDR.transfer(acc_ray[i][1], initial_tokens, {from: Alice})
        }


        // Veryify
        for(var i = 0; i < acc_ray.length; i++) { // For each account
            assert.strictEqual((await STK.balanceOf(acc_ray[i][1])).toString(), initial_tokens, ' User should have initial tokens.')
            assert.strictEqual((await UDR.balanceOf(acc_ray[i][1])).toString(), initial_tokens, ' User should have initial tokens.')
        }
    });


    it('Initialize MUDRs and Add Tokens to ODEX', async () => {
        console.log('\n')
        // Core Tokens
        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()
        // MUDR Tokens
        let fac = await Factory.deployed()
        let cMoat_create = await fac.createcMoat(strike, underlying, maturity, 
            'cMoat=STK/UDR C for 12S 4U Dec 30 2019',
            ((await STK.symbol()) + (await UDR.symbol()) + (maturity).toString() + typeC + (strike * 1 / decimals) + 'S' + (underlying * 1 / decimals) + 'U').toString())
        let cMoat_address = await fac.getcMoat(Alice)
        let _cMoat = await cMoat.at(cMoat_address)
        let pMoat_create = await fac.createpMoat(strike, underlying, maturity, 
            'pMoat=STK/UDR P for 12S 4U Dec 30 2019',
            ((await STK.symbol()) + (await UDR.symbol()) + (maturity).toString() + typeP + (strike * 1 / decimals) + 'S' + (underlying * 1 / decimals) + 'U').toString())
        let pMoat_address = await fac.getpMoat(Alice)
        let _pMoat = await pMoat.at(pMoat_address)
        console.log(await _pMoat.symbol())
        console.log(await STK.symbol())

        var tokens = [
            [(await STK.symbol()).toString(), STK.address],
            [(await UDR.symbol()).toString(), UDR.address],
            [(await _cMoat.symbol()).toString(), _cMoat.address],
            [(await _pMoat.symbol()).toString(), _pMoat.address],
        ]
        let odex = await Odex.deployed()
        for(var i = 0; i < tokens.length; i++) { // For each token, add it to ODEX
            let add = await odex.addToken(tokens[i][0], tokens[i][1])
            await getGas(add, 'Add' + (tokens[i][0]).toString())
        }

        before_after.push(await getLedger('Tokens Added on DEX, not Deposited', STK, UDR, _cMoat, _pMoat))
        await getLedger('Tokens Added on DEX, not Deposited', STK, UDR, _cMoat, _pMoat)
        await getDexLedger('Added Tokens', STK, UDR, _cMoat, _pMoat, odex)
    });


    it('Users Deposit and Withdraw Tokens from DEX', async () => {
        console.log('\n')
        // Core Tokens
        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()
        // MUDR Tokens
        let fac = await Factory.deployed()
        let cMoat_address = await fac.getcMoat(Alice)
        let _cMoat = await cMoat.at(cMoat_address)
        let pMoat_address = await fac.getpMoat(Alice)
        let _pMoat = await pMoat.at(pMoat_address)

        var tokens = [
            [(await STK.symbol()).toString(), STK],
            [(await UDR.symbol()).toString(), UDR],
            [(await _cMoat.symbol()).toString(), _cMoat],
            [(await _pMoat.symbol()).toString(), _pMoat],
        ]

        
        let odex = await Odex.deployed()
        for(var x = 0; x < acc_ray.length; x++) { // For each user, deposit each intial tokens
            for(var i = 0; i < tokens.length - 2; i++) {
                await tokens[i][1].approve(odex.address, initial_tokens, {from: acc_ray[x][1]})
                let deposit = await odex.depositToken(tokens[i][0], initial_tokens, {from: acc_ray[x][1]})
                await getGas(deposit, 'Deposit' + (tokens[i][0]).toString())
            }
        }


        await getLedger('Deposit Tokens into DEX', STK, UDR, _cMoat, _pMoat)
        await getDexLedger('Deposited Tokens', STK, UDR, _cMoat, _pMoat, odex)


        for(var x = 0; x < acc_ray.length; x++) { // For each user, withdraw each intial tokens
            for(var i = 0; i < tokens.length - 2; i++) {
                await tokens[i][1].approve(odex.address, initial_tokens, {from: acc_ray[x][1]})
                let withdraw = await odex.withdrawToken(tokens[i][0], initial_tokens, {from: acc_ray[x][1]})
                await getGas(withdraw, 'Withdraw' + (tokens[i][0]).toString())
            }
        }


        await getLedger('Withdraw Tokens from DEX', STK, UDR, _cMoat, _pMoat)
        await getDexLedger('Withdrawed Tokens', STK, UDR, _cMoat, _pMoat, odex)
    });


    it('Users Mint MUDRs and Deposit them into DEX', async () => {
        console.log('\n')
        // Core Tokens
        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()
        // MUDR Tokens
        let fac = await Factory.deployed()
        let cMoat_address = await fac.getcMoat(Alice)
        let _cMoat = await cMoat.at(cMoat_address)
        let pMoat_address = await fac.getpMoat(Alice)
        let _pMoat = await pMoat.at(pMoat_address)

        var tokens = [
            [(await STK.symbol()).toString(), STK],
            [(await UDR.symbol()).toString(), UDR],
            [(await _cMoat.symbol()).toString(), _cMoat],
            [(await _pMoat.symbol()).toString(), _pMoat],
        ]


        for(var i = 0; i < acc_ray.length; i++) { // For each user, mint a random amount of tokens between 10 and 100
            var underlying_amount = ((Math.floor((Math.random() * 90) + 10))*10**18).toFixed()
            let underlying_approve = await UDR.approve(cMoat_address, underlying_amount, {from: acc_ray[i][1]})
            let cMoat_write = await _cMoat.write(underlying_amount, {from: acc_ray[i][1]})
            var strike_amount = ((Math.floor((Math.random() * 90) + 10))*10**18).toFixed()
            let strike_approve = await STK.approve(pMoat_address, strike_amount, {from: acc_ray[i][1]})
            let pMoat_write = await _pMoat.write(strike_amount, {from: acc_ray[i][1]})
            await getGas(cMoat_write, 'cMoat Write' + (acc_ray[i][0]).toString())
            await getGas(pMoat_write, 'pMoat Write' + (acc_ray[i][0]).toString())
            await getEvents(cMoat_write, 'cMoat Write')
            await getEvents(pMoat_write, 'pMoat Write')
        }


        let odex = await Odex.deployed()
        for(var x = 0; x < acc_ray.length; x++) { // For each user, deposit MUDR balances
            for(var i = 2; i < tokens.length; i++) { // For each token, cMoat and pMoat
                await tokens[i][1].approve(odex.address, (await tokens[i][1].balanceOf(acc_ray[x][1])), {from: acc_ray[x][1]})
                let deposit = await odex.depositToken(tokens[i][0], (await tokens[i][1].balanceOf(acc_ray[x][1])), {from: acc_ray[x][1]})
                await getGas(deposit, 'Deposit' + (tokens[i][0]).toString())
            }
        }

        for(var x = 0; x < acc_ray.length; x++) {
            var eth = (50*10**18).toString()
            let eth_deposit = await odex.depositEth({from: acc_ray[x][1], value: eth})
            await getGas(eth_deposit, 'eth_deposit' + 'ETH')
        }

        await getLockBook('Write and Deposit into DEX', _cMoat, _pMoat)
        await getLedger('Deposit Tokens into DEX', STK, UDR, _cMoat, _pMoat)
        await getDexLedger('Deposited Tokens into DEX', STK, UDR, _cMoat, _pMoat, odex)
    });


    it('Users Swap MUDRs', async () => {
        console.log('\n')
        // Core Tokens
        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()
        // MUDR Tokens
        let fac = await Factory.deployed()
        let cMoat_address = await fac.getcMoat(Alice)
        let _cMoat = await cMoat.at(cMoat_address)
        let pMoat_address = await fac.getpMoat(Alice)
        let _pMoat = await pMoat.at(pMoat_address)
        let odex = await Odex.deployed()

        var tokens = [
            [(await STK.symbol()).toString(), STK],
            [(await UDR.symbol()).toString(), UDR],
            [(await _cMoat.symbol()).toString(), _cMoat],
            [(await _pMoat.symbol()).toString(), _pMoat],
        ]


        // For each user, put in a random buy order, and a random sell order for each token
        // Buys
        for(var i = 0; i < acc_ray.length; i++) {
            for(var x = 2; x < tokens.length; x++){ // For each token cMoat, pMoat
                var buy_amount = (((Math.floor((Math.random() * 10) + 1))*10**18).toFixed()) // Buy 1 to User Balance tokens
                var buy_price = ((Math.floor((Math.random() * 3) + 1)*10**18).toFixed()) // Buy Price between 1 to 10 Ether
                var buy = (await odex.buyToken(tokens[x][0], buy_price, buy_amount, {from: acc_ray[i][1]}))
                await getGas(buy, 'Buy' + (tokens[x][0]).toString())
            }
        }
        // Sells
        for(var i = 0; i < acc_ray.length; i++) {
            for(var x = 2; x < tokens.length; x++){ // For each token cMoat, pMoat
                var sell_amount = ((Math.floor((Math.random() * (((await odex.getTokenBalance(tokens[x][0], {from: acc_ray[i][1]}))/decimals) - 1)) + 1)*10**18).toFixed()) // Sell between 1 and (User's balance) of tokens
                var sell_price = ((Math.floor((Math.random() * 3) + 1)*10**18).toFixed()) // Sell Price between 1 to 10 Ether
                var sell = (await odex.sellToken(tokens[x][0], sell_price, sell_amount, {from: acc_ray[i][1]}))
                await getGas(sell, 'Sell' + (tokens[x][0]).toString())
            }
        }


        // Users withdraw the remaining DEX balances
        for(var x = 0; x < acc_ray.length; x++) { // For each user, withdraw each intial tokens
            for(var i = 2; i < tokens.length; i++) {
                let withdraw = await odex.withdrawToken(tokens[i][0], ((await odex.getTokenBalance(tokens[i][0], {from: acc_ray[x][1]}))), {from: acc_ray[x][1]})
                await getGas(withdraw, 'Withdraw' + (tokens[i][0]).toString())
            }
        }


        await getLockBook('Users Swapped MUDRs', _cMoat, _pMoat)
        await getLedger('Withdrawn from DEX after MUDR Swaps', STK, UDR, _cMoat, _pMoat)
        await getDexLedger('Withdrawn from DEX after MUDR Swaps', STK, UDR, _cMoat, _pMoat, odex)
    });


    it('Users Exercise their MUDRs', async () => {
        console.log('\n')
        // Core Tokens
        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()
        // MUDR Tokens
        let fac = await Factory.deployed()
        let cMoat_address = await fac.getcMoat(Alice)
        let _cMoat = await cMoat.at(cMoat_address)
        let pMoat_address = await fac.getpMoat(Alice)
        let _pMoat = await pMoat.at(pMoat_address)
        let odex = await Odex.deployed()
        // Tokens Array
        var tokens = [
            [(await STK.symbol()).toString(), STK],
            [(await UDR.symbol()).toString(), UDR],
            [(await _cMoat.symbol()).toString(), _cMoat],
            [(await _pMoat.symbol()).toString(), _pMoat],
        ]


        for(var i = 0; i < 2; i++) {
            for(var x = 0; x < acc_ray.length; x++) {
                let strike_balance = await STK.balanceOf(acc_ray[x][1], {from: acc_ray[x][1]})
                let underlying_balance = await UDR.balanceOf(acc_ray[x][1], {from: acc_ray[x][1]})
                let cMoat_balance = await _cMoat.balanceOf(acc_ray[x][1], {from: acc_ray[x][1]})
                let cMoat_approve = await STK.approve(cMoat_address, (strike), {from: acc_ray[x][1]})
                if((cMoat_balance).toString() * 1 > 2*10**18){
                    console.log(acc_ray[x][0], tokens[2][0], cMoat_balance.toString(), tokens[0][0], strike_balance.toString())
                    let cMoat_exercise = await _cMoat.exercise((10**18).toFixed(), {from: acc_ray[x][1]})
                }
                if((cMoat_balance).toString() * 1 < 2*10**18){
                    continue
                }
            }

            for(var x = 0; x < acc_ray.length; x++) {
                let strike_balance = await STK.balanceOf(acc_ray[x][1], {from: acc_ray[x][1]})
                let underlying_balance = await UDR.balanceOf(acc_ray[x][1], {from: acc_ray[x][1]})
                let pMoat_balance = await _pMoat.balanceOf(acc_ray[x][1], {from: acc_ray[x][1]})
                let pMoat_approve = await UDR.approve(pMoat_address, (underlying), {from: acc_ray[x][1]})
                
                if((pMoat_balance).toString() * 1 > 3*10**18){
                    console.log(acc_ray[x][0], tokens[3][0], pMoat_balance.toString(), tokens[1][0], underlying_balance.toString())
                    let pMoat_exercise = await _pMoat.exercise((10**18).toFixed(), {from: acc_ray[x][1]})
                }
                if((pMoat_balance).toString() * 1 < 2*10**18){
                    continue
                }
            }
        }
        

        await getLockBook('Should be withdrawn from DEX', _cMoat, _pMoat)
        await getLedger('Exercise and Close MUDRS', STK, UDR, _cMoat, _pMoat)
        await getDexLedger('All tokens withdrawn from DEX', STK, UDR, _cMoat, _pMoat, odex)
        console.log(ledger)
    });


})