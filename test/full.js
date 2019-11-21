/*
@title A full test which implements multiple parts, OAT, DAI, DOZ, ZOD, and ODEX

@notice Sets up user's accounts on the ODEX, users can then buy, write, trade, exercise, and close the MOATs

@author Alexander Angel

@dev First tests just check initalization, then we test user's interaction with the dex
     then we process transactions through the MOAT, and finally we settle on the dex.
*/

const assert = require('assert').strict;
const Factory = artifacts.require('Factory')
const Wax = artifacts.require('Wax')
const Dai = artifacts.require('Dai') // Strike Asset
const Oat = artifacts.require('Oat') // Underlying Asset
const Doz = artifacts.require('Doz') // Optionality Purchase Transfer Right -> Purchaser underlying for strike
const Zod = artifacts.require('Zod') // Optionality Sale Transfer Right -> Sell underlying for strike
const Odex = artifacts.require('Odex')

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
    var strike = (12*10**18).toFixed() // Strike is 12 DAI
    var underlying = (4*10**18).toFixed() // Underlying is 4 OAT
    var maturity = 1573992000
    var premium = (0.25*10**18).toFixed() // Premium price is 0.25 Ether


    // Parameters Array
    var par_ray = [
        ['Strike', strike],
        ['Underlying', underlying]
        ['Maturity', maturity],
        ['Premium', premium]
    ]


    // Gas Array
    let gas = []


    // Balance Array
    let ledger = [
        // Pushed to in each test
        // [Test Name, 'Alice', Account Address, Ether Balance, Dai Balance, Oat Balance, Doz Balance, Zod Balance]
    ]

    let dex_ledger = []


    let lock_book = []

    let per_book = []

    let events = [
        // [per event [Test, Event, arg 1, arg 2, etc]]
    ]

    let before_after = []

    let per_event = []


    var decimals = 10**18
    var initial_tokens = '100000000000000000000000' // 100,000 Tokens

    // Functions 
    // Check All User Balances for All Tokens, Track Changes between Tests
    // Check Amount of gas used for each fuction call
    // Function to get All Events / Logs

    async function getLedger(test, dai, oat, doz, zod) {
        /*
        @param test - string, name - string, address - address, ether - wei, dai -> zod contract instance
        */
        for(var i = 0; i < acc_ray.length; i++) { // For each account, append the ledger array with data
            let ether_bal = ((await web3.eth.getBalance(acc_ray[i][1]))).toString()
            let dai_bal = ((await dai.balanceOf(acc_ray[i][1]))).toString()
            let oat_bal = ((await oat.balanceOf(acc_ray[i][1]))).toString()
            let doz_bal = ((await doz.balanceOf(acc_ray[i][1]))).toString()
            let zod_bal = ((await zod.balanceOf(acc_ray[i][1]))).toString()
            ledger.push([test, acc_ray[i][0], acc_ray[i][1], ether_bal, dai_bal, oat_bal, doz_bal, zod_bal])
        }
    }

    async function getDexLedger(test, dai, oat, doz, zod, odex) {
        /*
        @param test - string, name - string, address - address, ether - wei, dai -> zod contract instance
        */
        for(var i = 0; i < acc_ray.length; i++) { // For each account, append the ledger array with data
            let ether_bal = (await odex.ethBalances(acc_ray[i][1])).toString()
            let dai_bal = ((await odex.getTokenBalance((await dai.symbol()).toString(), {from: acc_ray[i][1]}))).toString()
            let oat_bal = ((await odex.getTokenBalance((await oat.symbol()).toString(), {from: acc_ray[i][1]}))).toString()
            let doz_bal = ((await odex.getTokenBalance((await doz.symbol()).toString(), {from: acc_ray[i][1]}))).toString()
            let zod_bal = ((await odex.getTokenBalance((await zod.symbol()).toString(), {from: acc_ray[i][1]}))).toString()
            dex_ledger.push([test, acc_ray[i][0], acc_ray[i][1], ether_bal, dai_bal, oat_bal, doz_bal, zod_bal])
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


    async function getLockBook(test, doz, zod) {
        let doz_book_len = await doz.lockBook__lock_length
        per_book.push('DOZ')
        for(var i = 0; i < 11; i++) {
            per_book.push((await doz.lockBook__locks__user(i)).toString(), (await doz.lockBook__locks__underlying_amount(i)).toString())
        }
        per_book.push('ZOD')
        let zod_book_len = await zod.lockBook__lock_length
        for(var i = 0; i < 11; i++) {
            per_book.push((await zod.lockBook__locks__user(i)).toString(), (await zod.lockBook__locks__strike_amount(i)).toString())
        }
        lock_book.push([test, per_book])
    }

/*
@notice These are the tests which we will run to push the limits of the contracts

Each of the 9 users will recieve 100,000 of the Underlying and Asset tokens.
They will then purchase, write, exercise, and close DOZ and ZOD MOATs

There is a function that manages the transfers and it will operate for 100 tx before it ends the test.



*/


    it('Initialize Token Contracts and Disperse Funds', async () => {
        console.log('\n')
        let dai = await Dai.deployed()
        let oat = await Oat.deployed()

        /* 
            Initial Transfer 
            Alice has the initial Oat
            Bob has the initial Dai 
        */


        // Transfer
        for(var i = 0; i < acc_ray.length; i++) { // For each account
            await dai.transfer(acc_ray[i][1], initial_tokens, {from: Bob})
            await oat.transfer(acc_ray[i][1], initial_tokens, {from: Alice})
        }


        // Veryify
        for(var i = 0; i < acc_ray.length; i++) { // For each account
            assert.strictEqual((await dai.balanceOf(acc_ray[i][1])).toString(), initial_tokens, ' User should have initial tokens.')
            assert.strictEqual((await oat.balanceOf(acc_ray[i][1])).toString(), initial_tokens, ' User should have initial tokens.')
        }
    });


    it('Initialize MOATs and Add Tokens to ODEX', async () => {
        console.log('\n')
        // Core Tokens
        let dai = await Dai.deployed()
        let oat = await Oat.deployed()
        // Moat Tokens
        let fac = await Factory.deployed()
        let doz = await fac.createDoz(strike, underlying, maturity)
        let doz_address = await fac.getDoz(Alice)
        let _doz = await Doz.at(doz_address)
        let zod = await fac.createZod(strike, underlying, maturity)
        let zod_address = await fac.getZod(Alice)
        let _zod = await Zod.at(zod_address)

        var tokens = [
            [(await dai.symbol()).toString(), dai.address],
            [(await oat.symbol()).toString(), oat.address],
            [(await _doz.symbol()).toString(), _doz.address],
            [(await _zod.symbol()).toString(), _zod.address],
        ]
        let odex = await Odex.deployed()
        for(var i = 0; i < tokens.length; i++) { // For each token, add it to ODEX
            let add = await odex.addToken(tokens[i][0], tokens[i][1])
            await getGas(add, 'Add' + (tokens[i][0]).toString())
        }

        before_after.push(await getLedger('Tokens Added on DEX, not Deposited', dai, oat, _doz, _zod))
        await getLedger('Tokens Added on DEX, not Deposited', dai, oat, _doz, _zod)
        await getDexLedger('Added Tokens', dai, oat, _doz, _zod, odex)
    });


    it('Users Deposit and Withdraw Tokens from DEX', async () => {
        console.log('\n')
        // Core Tokens
        let dai = await Dai.deployed()
        let oat = await Oat.deployed()
        // Moat Tokens
        let fac = await Factory.deployed()
        let doz_address = await fac.getDoz(Alice)
        let _doz = await Doz.at(doz_address)
        let zod_address = await fac.getZod(Alice)
        let _zod = await Zod.at(zod_address)

        var tokens = [
            [(await dai.symbol()).toString(), dai],
            [(await oat.symbol()).toString(), oat],
            [(await _doz.symbol()).toString(), _doz],
            [(await _zod.symbol()).toString(), _zod],
        ]

        
        let odex = await Odex.deployed()
        for(var x = 0; x < acc_ray.length; x++) { // For each user, deposit each intial tokens
            for(var i = 0; i < tokens.length - 2; i++) {
                await tokens[i][1].approve(odex.address, initial_tokens, {from: acc_ray[x][1]})
                let deposit = await odex.depositToken(tokens[i][0], initial_tokens, {from: acc_ray[x][1]})
                await getGas(deposit, 'Deposit' + (tokens[i][0]).toString())
            }
        }


        await getLedger('Deposit Tokens into DEX', dai, oat, _doz, _zod)
        await getDexLedger('Deposited Tokens', dai, oat, _doz, _zod, odex)


        for(var x = 0; x < acc_ray.length; x++) { // For each user, withdraw each intial tokens
            for(var i = 0; i < tokens.length - 2; i++) {
                await tokens[i][1].approve(odex.address, initial_tokens, {from: acc_ray[x][1]})
                let withdraw = await odex.withdrawToken(tokens[i][0], initial_tokens, {from: acc_ray[x][1]})
                await getGas(withdraw, 'Withdraw' + (tokens[i][0]).toString())
            }
        }


        await getLedger('Withdraw Tokens from DEX', dai, oat, _doz, _zod)
        await getDexLedger('Withdrawed Tokens', dai, oat, _doz, _zod, odex)
    });


    it('Users Mint MOATs and Deposit them into DEX', async () => {
        console.log('\n')
        // Core Tokens
        let dai = await Dai.deployed()
        let oat = await Oat.deployed()
        // Moat Tokens
        let fac = await Factory.deployed()
        let doz_address = await fac.getDoz(Alice)
        let _doz = await Doz.at(doz_address)
        let zod_address = await fac.getZod(Alice)
        let _zod = await Zod.at(zod_address)

        var tokens = [
            [(await dai.symbol()).toString(), dai],
            [(await oat.symbol()).toString(), oat],
            [(await _doz.symbol()).toString(), _doz],
            [(await _zod.symbol()).toString(), _zod],
        ]


        for(var i = 0; i < acc_ray.length; i++) { // For each user, mint a random amount of tokens between 10 and 100
            var underlying_amount = ((Math.floor((Math.random() * 90) + 10))*10**18).toFixed()
            let underlying_approve = await oat.approve(doz_address, underlying_amount, {from: acc_ray[i][1]})
            let doz_write = await _doz.write(underlying_amount, {from: acc_ray[i][1]})
            var strike_amount = ((Math.floor((Math.random() * 90) + 10))*10**18).toFixed()
            let strike_approve = await dai.approve(zod_address, strike_amount, {from: acc_ray[i][1]})
            let zod_write = await _zod.write(strike_amount, {from: acc_ray[i][1]})
            await getGas(doz_write, 'Doz Write' + (acc_ray[i][0]).toString())
            await getGas(zod_write, 'Zod Write' + (acc_ray[i][0]).toString())
            await getEvents(doz_write, 'Doz Write')
            await getEvents(zod_write, 'Zod Write')
        }


        let odex = await Odex.deployed()
        for(var x = 0; x < acc_ray.length; x++) { // For each user, deposit MOAT balances
            for(var i = 2; i < tokens.length; i++) { // For each token, DOZ and ZOD
                await tokens[i][1].approve(odex.address, (await tokens[i][1].balanceOf(acc_ray[x][1])), {from: acc_ray[x][1]})
                let deposit = await odex.depositToken(tokens[i][0], (await tokens[i][1].balanceOf(acc_ray[x][1])), {from: acc_ray[x][1]})
                await getGas(deposit, 'Deposit' + (tokens[i][0]).toString())
            }
        }

        await getLockBook('Write and Deposit into DEX', _doz, _zod)
        await getLedger('Deposit Tokens into DEX', dai, oat, _doz, _zod)
        await getDexLedger('Deposited Tokens into DEX', dai, oat, _doz, _zod, odex)
    });


    it('Users Swap MOATs', async () => {
        console.log('\n')
        // Core Tokens
        let dai = await Dai.deployed()
        let oat = await Oat.deployed()
        // Moat Tokens
        let fac = await Factory.deployed()
        let doz_address = await fac.getDoz(Alice)
        let _doz = await Doz.at(doz_address)
        let zod_address = await fac.getZod(Alice)
        let _zod = await Zod.at(zod_address)
        let odex = await Odex.deployed()

        var tokens = [
            [(await dai.symbol()).toString(), dai],
            [(await oat.symbol()).toString(), oat],
            [(await _doz.symbol()).toString(), _doz],
            [(await _zod.symbol()).toString(), _zod],
        ]


        // For each user, put in a random buy order, and a random sell order for each token
        // Buys
        for(var i = 0; i < acc_ray.length; i++) {
            for(var x = 2; x < tokens.length; x++){ // For each token DOZ, ZOD
                var buy_amount = (((Math.floor((Math.random() * 10) + 1))*10**18).toFixed()) // Buy 1 to User Balance tokens
                var buy_price = ((Math.floor((Math.random() * 3) + 1)*10**18).toFixed()) // Buy Price between 1 to 10 Ether
                var buy = (await odex.buyToken(tokens[x][0], buy_price, buy_amount, {from: acc_ray[i][1]}))
                await getGas(buy, 'Buy' + (tokens[x][0]).toString())
            }
        }
        // Sells
        for(var i = 0; i < acc_ray.length; i++) {
            for(var x = 2; x < tokens.length; x++){ // For each token DOZ, ZOD
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


        await getLockBook('Users Swapped Moats', _doz, _zod)
        await getLedger('Withdrawn from DEX after MOAT Swaps', dai, oat, _doz, _zod)
        await getDexLedger('Withdrawn from DEX after MOAT Swaps', dai, oat, _doz, _zod, odex)
    });


    it('Users Exercise Half and Close Half of their MOATS', async () => {
        console.log('\n')
        // Core Tokens
        let dai = await Dai.deployed()
        let oat = await Oat.deployed()
        // Moat Tokens
        let fac = await Factory.deployed()
        let doz_address = await fac.getDoz(Alice)
        let _doz = await Doz.at(doz_address)
        let zod_address = await fac.getZod(Alice)
        let _zod = await Zod.at(zod_address)
        let odex = await Odex.deployed()

        var tokens = [
            [(await dai.symbol()).toString(), dai],
            [(await oat.symbol()).toString(), oat],
            [(await _doz.symbol()).toString(), _doz],
            [(await _zod.symbol()).toString(), _zod],
        ]


        // For each user, get their MOAT balance and divide it in half, then close and exercise each half.
        //for(var x = 0; x < acc_ray.length; x++) { // Users
        //    for(var i = 2; i < tokens.length; i++){ // Tokens
        //        let close_half = ((Math.floor((Math.random() * (((await tokens[i][1].balanceOf(acc_ray[x][1], {from: acc_ray[x][1]}))/decimals) - 1)) + 1)*10**18).toFixed())
        //        let close = (await tokens[i][1].close((close_half), {from: acc_ray[x][1]}))
        //        await getGas(close, 'Close' + (tokens[i][0]).toString())
        //    }
        //}

        console.log(ledger)



        for(var x = 0; x < acc_ray.length; x++) { // Close DOZ
            let close_half = ((Math.floor((Math.random() * ((await tokens[2][1].lockBook__locks__underlying_amount(x)) / underlying) ) + 1)*10**18).toFixed())
            let close = (await tokens[2][1].close((close_half), {from: acc_ray[x][1]}))
            await getGas(close, 'Close' + (tokens[2][0]).toString())
        }


        for(var x = 0; x < acc_ray.length; x++) { // Close ZOD
            let close_half = ((Math.floor((Math.random() * ((await tokens[3][1].lockBook__locks__strike_amount(x)) / strike) ) + 1)*10**18).toFixed())
            let close = (await tokens[3][1].close((close_half), {from: acc_ray[x][1]}))
            await getGas(close, 'Close' + (tokens[3][0]).toString())
        }

        for(var x = 0; x < acc_ray.length; x++) { // Users
            for(var i = 2; i < tokens.length; i++){ // Tokens
                let exercise_half = ((await tokens[i][1].balanceOf(acc_ray[x][1], {from: acc_ray[x][1]})).toFixed())
                let exercise = (await tokens[i][1].exercise(exercise_half, {from: acc_ray[x][1]}))
                await getGas(exercise, 'Exercise' + (tokens[i][0]).toString())
            }
        }
        

        before_after.push(await getLedger('Exercise and Close MOATS', dai, oat, _doz, _zod))
        await getLockBook('Should be withdrawn from DEX', _doz, _zod)
        await getLedger('Exercise and Close MOATS', dai, oat, _doz, _zod)
        await getDexLedger('All tokens withdrawn from DEX', dai, oat, _doz, _zod, odex)
        console.log(before_after)
    });


})