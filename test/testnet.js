/*
@title A full test which implements multiple parts, UDR, STK, cMoat, pMoat, and ODEX for the rinkeby testnet

@notice Sets up user's accounts on the ODEX, users can then buy, write, trade, exercise, and close the MOATs

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

contract('Full Test', accounts => {


    // Starting users to use in test
    var users_test = 2


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

    let gas = []

    let ledger = []

    let events = []

    let per_book = []

    let lock_book = []

    let per_event = []

    let dex_ledger = []

    
    /*
    @dev async functions that get ledger and other account information easily
    */
       

    async function getLedger(test, STK, UDR, cMoat, pMoat) {
        /*
        @param test String of test name
        @param STK Address of token
        @param UDR Address of token
        @param cMOAT Address of Token
        @param pMOAT Address of Token
        @return Appends ledger array with each user's balance of each token in parameters
        */
        for(var i = 0; i < users_test; i++) { // For each account, append the ledger array with data
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
        @param test String of test name
        @param STK Address of token
        @param UDR Address of token
        @param cMOAT Address of Token
        @param pMOAT Address of Token
        @param odex Odex contract instance
        @return Appends ODEX ledger array with each user's balance of each token in parameters
        */
        for(var i = 0; i < users_test; i++) { // For each account, append the ledger array with data
            let ether_bal = (await odex.ethBalances(acc_ray[i][1])).toString()
            let STK_bal = ((await odex.getTokenBalance((await STK.symbol()).toString(), {from: acc_ray[i][1]}))).toString()
            let UDR_bal = ((await odex.getTokenBalance((await UDR.symbol()).toString(), {from: acc_ray[i][1]}))).toString()
            let cMoat_bal = ((await odex.getTokenBalance((await cMoat.symbol()).toString(), {from: acc_ray[i][1]}))).toString()
            let pMoat_bal = ((await odex.getTokenBalance((await pMoat.symbol()).toString(), {from: acc_ray[i][1]}))).toString()
            dex_ledger.push([test, acc_ray[i][0], acc_ray[i][1], ether_bal, STK_bal, UDR_bal, cMoat_bal, pMoat_bal])
        }
    }


    async function getGas(func, name) {
        /*
        @param func function to get gas from
        @param name string of function name
        */
        let spent = await func.receipt.gasUsed
        gas.push([name + ' gas: ', spent])
    }


    async function getEvents(func, test) {
        /*
        @param func function to get events from
        @param name string of function name
        */
        for(var i = 0; i < func.receipt.logs.length; i++) { // For each log in event
            per_event.push(func.receipt.logs[i].event)
            for(x = 0; x < func.receipt.logs[i].args.__length__; x++) { // For each arg in event
                per_event.push((func.receipt.logs[i].args[x]).toString())
            }
        }
        events.push([test, per_event])
    }


    async function getLockBook(test, cMoat, pMoat) {
        /*
        @param test string of test name
        @param cMoat Contract instance of cMOAT
        @param pMoat Contract instance of cMOAT
        @return Appends lock book array with a User's key and the corresponding underwritten balance, User[key][balance]
        */
        let cMoat_book_len = await cMoat.lockBook__lock_length
        per_book.push('cMoat')
        for(var i = 0; i < 2; i++) {
            per_book.push((await cMoat.lockBook__locks__user(i+1)).toString(), (await cMoat.lockBook__locks__underlying_amount(i+1)).toString())
        }
        per_book.push('pMoat')
        let pMoat_book_len = await pMoat.lockBook__lock_length
        for(var i = 0; i < 2; i++) {
            per_book.push((await pMoat.lockBook__locks__user(i+1)).toString(), (await pMoat.lockBook__locks__strike_amount(i+1)).toString())
        }
        lock_book.push([test, per_book])
    }


    /*
    @dev These are the tests which we will run to push the limits of the contracts
         Alice and Bob will trade, exercise and close MOATs.
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
        await UDR.transfer(Bob, initial_tokens, {from: Alice}) // From Accounts[0]
        await STK.transfer(Alice, initial_tokens, {from: Bob}) // From Accounts[1]


        // Verify
        for(var i = 0; i < users_test; i++) { // For each account
            assert.strictEqual((await STK.balanceOf(Alice)).toString(), initial_tokens, ' User should have initial tokens.')
            assert.strictEqual((await UDR.balanceOf(Bob)).toString(), initial_tokens, ' User should have initial tokens.')
        }
    });


    it('Initialize MOATs and Add Tokens to ODEX', async () => {
        console.log('\n')
        /*
            @dev Instances of contracts 
        */
        

        // Core Tokens
        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()
        

        /*
            @dev Factory function: createcMOAT, createpMOAT
        */


        // Create Tokens from Factory
        let fac = await Factory.deployed()
        let cMoat_create = await fac.createcMoat(strike, underlying, maturity, 
            'cMoat=STK/UDR C for 12S per 4U Dec 30 2019',
            ((await STK.symbol()) + (await UDR.symbol()) + (maturity).toString() + typeC + (strike * 1 / decimals) + 'S' + (underlying * 1 / decimals) + 'U').toString())
        let pMoat_create = await fac.createpMoat(strike, underlying, maturity, 
            'pMoat=STK/UDR P for 12S per 4U Dec 30 2019',
            ((await STK.symbol()) + (await UDR.symbol()) + (maturity).toString() + typeP + (strike * 1 / decimals) + 'S' + (underlying * 1 / decimals) + 'U').toString())

        
        // MOAT Addresses and Instances
        let cMoat_address = await fac.getcMoat(Alice)
        let _cMoat = await cMoat.at(cMoat_address)
        let pMoat_address = await fac.getpMoat(Alice)
        let _pMoat = await pMoat.at(pMoat_address)
        
        
        // ODEX
        let odex = await Odex.deployed()
        

        /*
            @dev Verify create
        */


        for(var i = 0; i < 2; i++) { // For each account
             assert.strictEqual((await _cMoat.name()), 'cMoat=STK/UDR C for 12S per 4U Dec 30 2019', ' Contracts should have same name.')
             assert.strictEqual((await _pMoat.name()), 'pMoat=STK/UDR P for 12S per 4U Dec 30 2019', ' Contracts should have same name.')
        }


        // Tokens array with [symbol][address]
        var tokens = [
            [(await STK.symbol()).toString(), STK.address],
            [(await UDR.symbol()).toString(), UDR.address],
            [(await _cMoat.symbol()).toString(), _cMoat.address],
            [(await _pMoat.symbol()).toString(), _pMoat.address],
        ]


    
        // Add MOAT tokens to ODEX
        for(var i = 0; i < tokens.length; i++) { // For each token, add it to ODEX
            let add = await odex.addToken(tokens[i][0], tokens[i][1])
            await getGas(add, 'Add' + (tokens[i][0]).toString())
        }

        
        // Information update
        await getLedger('Tokens Added on DEX, not Deposited', STK, UDR, _cMoat, _pMoat) // Update and append legder array
        await getDexLedger('Added Tokens', STK, UDR, _cMoat, _pMoat, odex) // Update and append DEX ledger array
    });


    it('Users Deposit and Withdraw Tokens from DEX', async () => {
        console.log('\n')


        // Core Tokens
        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()


        // MOAT Tokens
        let fac = await Factory.deployed()
        let cMoat_address = await fac.getcMoat(Alice)
        let _cMoat = await cMoat.at(cMoat_address)
        let pMoat_address = await fac.getpMoat(Alice)
        let _pMoat = await pMoat.at(pMoat_address)

        
        // ODEX
        let odex = await Odex.deployed()
        var tokens = [
            [(await STK.symbol()).toString(), STK],
            [(await UDR.symbol()).toString(), UDR],
            [(await _cMoat.symbol()).toString(), _cMoat],
            [(await _pMoat.symbol()).toString(), _pMoat],
        ]


        /*
            @dev ODEX function: depositToken
        */
        

        for(var x = 0; x < users_test; x++) { // For each user, deposit each intial token STK and UDR
            for(var i = 0; i < tokens.length - 2; i++) {
                await tokens[i][1].approve(odex.address, initial_tokens, {from: acc_ray[x][1]})
                let deposit = await odex.depositToken(tokens[i][0], initial_tokens, {from: acc_ray[x][1]})
                await getGas(deposit, 'Deposit' + (tokens[i][0]).toString())
            }
        }


        /*
            @dev Verify Deposit
        */


        for(var x = 0; x < users_test; x++) { // For each user in test
            for(var i = 0; i < tokens.length - 2; i++) { // For each token deposited
                assert.strictEqual((await odex.getTokenBalance(tokens[i][0], {from: acc_ray[x][1]})).toString(), initial_tokens, 'Balance should equal parameter given.')
            }
        }

        await getLedger('Deposit Tokens into DEX', STK, UDR, _cMoat, _pMoat)
        await getDexLedger('Deposited Tokens', STK, UDR, _cMoat, _pMoat, odex)


        /*
            @dev ODEX function: withdrawToken
        */


        for(var x = 0; x < users_test; x++) { // For each user, withdraw each intial tokens
            for(var i = 0; i < tokens.length - 2; i++) {
                await tokens[i][1].approve(odex.address, initial_tokens, {from: acc_ray[x][1]})
                let withdraw = await odex.withdrawToken(tokens[i][0], initial_tokens, {from: acc_ray[x][1]})
                await getGas(withdraw, 'Withdraw' + (tokens[i][0]).toString())
            }
        }


        /*
            @dev Verify Withdraw
        */


        for(var x = 0; x < users_test; x++) { // For each user in test
            for(var i = 0; i < tokens.length - 2; i++) { // For each token deposited
                assert.strictEqual((await odex.getTokenBalance(tokens[i][0], {from: acc_ray[x][1]})).toString(), '0', 'ODEX Token Balance should be 0.')
            }
        }


        assert.strictEqual((await tokens[0][1].balanceOf(Alice, {from: Alice})).toString(), initial_tokens, 'User balance should be initial amount in parameter.')
        assert.strictEqual((await tokens[1][1].balanceOf(Bob, {from: Bob})).toString(), initial_tokens, 'User balance should be initial amount in parameter.')


        // Information update
        await getLedger('Withdraw Tokens from DEX', STK, UDR, _cMoat, _pMoat)
        await getDexLedger('Withdrawed Tokens', STK, UDR, _cMoat, _pMoat, odex)
    });


    it('Users Mint MOATs and Deposit them into DEX', async () => {
        console.log('\n')


        // Core Tokens
        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()


        // MOAT Tokens
        let fac = await Factory.deployed()
        let cMoat_address = await fac.getcMoat(Alice)
        let _cMoat = await cMoat.at(cMoat_address)
        let pMoat_address = await fac.getpMoat(Alice)
        let _pMoat = await pMoat.at(pMoat_address)


        // ODEX
        let odex = await Odex.deployed()
        var tokens = [
            [(await STK.symbol()).toString(), STK],
            [(await UDR.symbol()).toString(), UDR],
            [(await _cMoat.symbol()).toString(), _cMoat],
            [(await _pMoat.symbol()).toString(), _pMoat],
        ]


        /*
            @dev cMOAT and pMOAT function: write
        */


        for(var i = 0; i < users_test; i++) { // For each user, mint a random amount of tokens between 10 and 100
            // cMOAT write
            var underlying_amount = ((Math.floor((Math.random() * 90) + 10))*10**18).toFixed()
            let underlying_approve = await UDR.approve(cMoat_address, underlying_amount, {from: acc_ray[i][1]})
            let cMoat_write = await _cMoat.write(underlying_amount, {from: acc_ray[i][1]})
            console.log('cMoat', acc_ray[i][0], underlying_amount)
            // pMOAT write
            var strike_amount = ((Math.floor((Math.random() * 90) + 10))*10**18).toFixed()
            let strike_approve = await STK.approve(pMoat_address, strike_amount, {from: acc_ray[i][1]})
            let pMoat_write = await _pMoat.write(strike_amount, {from: acc_ray[i][1]})
            console.log('pMoat', acc_ray[i][0], strike_amount)
            /*
            @dev Verify Write
            */

            assert.strictEqual((await _cMoat.lockBook__locks__underlying_amount(i+1)).toString(), underlying_amount, 'cMOAT underlying should match parameter.') // The '1' in the lockBook is the first written amount in the book
            assert.strictEqual((await _pMoat.lockBook__locks__strike_amount(i+1)).toString(), strike_amount, 'pMOAT strike should match parameter.')

            // Information update
            await getGas(cMoat_write, 'cMoat Write' + (acc_ray[i][0]).toString())
            await getGas(pMoat_write, 'pMoat Write' + (acc_ray[i][0]).toString())
            await getEvents(cMoat_write, 'cMoat Write')
            await getEvents(pMoat_write, 'pMoat Write')
        }


        /*
            @notice ODEX function: depositToken
        */


        for(var x = 0; x < users_test; x++) { // For each user
            for(var i = 2; i < tokens.length; i++) { // For each token, cMoat and pMoat
                let deposit_amount = (await tokens[i][1].balanceOf(acc_ray[x][1])).toString()
                let deposit_approve = (await tokens[i][1].approve(odex.address, deposit_amount, {from: acc_ray[x][1]}))
                let deposit = await odex.depositToken(tokens[i][0], (await tokens[i][1].balanceOf(acc_ray[x][1])), {from: acc_ray[x][1]})
                /*
                @dev Verify Deposit
                */
               console.log('deposit: ', acc_ray[x][0], tokens[i][0], deposit_amount)
                assert.strictEqual((await odex.getTokenBalance(tokens[i][0], {from: acc_ray[x][1]})).toString(), deposit_amount, 'Balance should equal parameter given.')
                await getGas(deposit, 'Deposit' + (tokens[i][0]).toString())
            }
        }


        /*
            @notice ODEX function: depositEth
        */


        for(var x = 0; x < users_test; x++) {
            var eth = (50*10**18).toString()
            let eth_deposit = await odex.depositEth({from: acc_ray[x][1], value: eth})
            await getGas(eth_deposit, 'eth_deposit' + 'ETH')
        }


        /*
            @dev Verify Deposit
        */


        for(var x = 0; x < users_test; x++) { // For each user in test
            assert.strictEqual((await odex.ethBalances(acc_ray[x][1], {from: acc_ray[x][1]})).toString(), eth, 'Balance should equal parameter given.')
        }


        // Update information
        await getLockBook('Write and Deposit into DEX', _cMoat, _pMoat)
        await getLedger('Deposit Tokens into DEX', STK, UDR, _cMoat, _pMoat)
        await getDexLedger('Deposited Tokens into DEX', STK, UDR, _cMoat, _pMoat, odex)
    });


    it('Users Swap MOATs', async () => {
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

        // ODEX
        let odex = await Odex.deployed()
        var tokens = [
            [(await STK.symbol()).toString(), STK],
            [(await UDR.symbol()).toString(), UDR],
            [(await _cMoat.symbol()).toString(), _cMoat],
            [(await _pMoat.symbol()).toString(), _pMoat],
        ]


        /*
            @dev ODEX function: buyToken, sellToken
                 Alice and Bob will effectively swap their tokens through the ODEX order book
        */
        
        // Purchase/Sale Prices
        var buy_price = (1*10**18).toFixed() 
        var sell_price = (1*10**18).toFixed() 


        // Alice will purchase Bob's balance of pMOAT and sell her balance of cMoat
        let alice_buy_amount = (await odex.getTokenBalance(tokens[3][0], {from: Bob})).toString()
        let alice_buy = (await odex.buyToken(tokens[3][0], buy_price, alice_buy_amount, {from: Alice}))
        let alice_sell_amount = (await odex.getTokenBalance(tokens[2][0], {from: Alice})).toString()
        let alice_sell = (await odex.sellToken(tokens[2][0], sell_price, alice_sell_amount, {from: Alice}))
        await getGas(alice_buy, 'Alice Buy' + (tokens[3][0]).toString())
        await getGas(alice_sell, 'Alice Sell' + (tokens[2][0]).toString())

        // Bob will purchase Alice's balance of cMOAT and sell his balance of pMoat
        let bob_buy_amount = alice_sell_amount
        let bob_buy = (await odex.buyToken(tokens[2][0], buy_price, bob_buy_amount, {from: Bob}))
        let bob_sell_amount = alice_buy_amount
        let bob_sell = (await odex.sellToken(tokens[3][0], sell_price, bob_sell_amount, {from: Bob}))
        await getGas(bob_buy, 'Bob Buy' + (tokens[2][0]).toString())
        await getGas(bob_sell, 'Bob Sell' + (tokens[3][0]).toString())
        console.log('alice buy amt ', alice_buy_amount)
        console.log('alice sell amt ', alice_sell_amount)
        console.log('bob buy amt ', bob_buy_amount)
        console.log('bob sell amt ', bob_sell_amount)



        /*
            @dev ODEX function: withdrawToken
        */

        for(var x = 0; x < users_test; x++) { // For each user, withdraw
            for(var i = 2; i < tokens.length; i++) {
                let withdraw = await odex.withdrawToken(tokens[i][0], ((await odex.getTokenBalance(tokens[i][0], {from: acc_ray[x][1]}))), {from: acc_ray[x][1]})
                await getGas(withdraw, 'Withdraw' + (tokens[i][0]).toString())
            }
        }


        /*
            @dev Verify Withdraw
        */

        assert.strictEqual((await odex.getTokenBalance(tokens[3][0], {from: Alice})).toString(), '0', 'ODEX Token Balance should be 0.')
        assert.strictEqual((await tokens[2][1].balanceOf(Alice, {from: Alice})).toString(), '0', 'User should have sold all of one of their tokens.')
        assert.strictEqual((await odex.getTokenBalance(tokens[2][0], {from: Bob})).toString(), '0', 'ODEX Token Balance should be 0.')
        assert.strictEqual((await tokens[3][1].balanceOf(Bob, {from: Bob})).toString(), '0', 'User should have sold all of one of their tokens.')
        

        // Information update
        await getLockBook('Users Swapped MOATs', _cMoat, _pMoat)
        await getLedger('Withdrawn from DEX after MUDR Swaps', STK, UDR, _cMoat, _pMoat)
        await getDexLedger('Withdrawn from DEX after MUDR Swaps', STK, UDR, _cMoat, _pMoat, odex)
    });


    it('Users Exercise their MOATs', async () => {
        console.log('\n')


        // Core Tokens
        let STK = await Stk.deployed()
        let UDR = await Udr.deployed()


        // MOAT Tokens
        let fac = await Factory.deployed()
        let cMoat_address = await fac.getcMoat(Alice)
        let _cMoat = await cMoat.at(cMoat_address)
        let pMoat_address = await fac.getpMoat(Alice)
        let _pMoat = await pMoat.at(pMoat_address)


        // ODEX
        let odex = await Odex.deployed()
        var tokens = [
            [(await STK.symbol()).toString(), STK],
            [(await UDR.symbol()).toString(), UDR],
            [(await _cMoat.symbol()).toString(), _cMoat],
            [(await _pMoat.symbol()).toString(), _pMoat],
        ]


        /*
            @dev cMOAT and pMOAT function: exercise
        */


        


        let alice_underlying_balance = (await UDR.balanceOf(Alice, {from: Alice})).toString()
        let alice_pMoat_balance = (await _pMoat.balanceOf(Alice, {from: Alice})).toString()
        let alice_pMoat_approve = await UDR.approve(pMoat_address, (alice_underlying_balance), {from: Alice})
        console.log('alice pmoat bal ', alice_pMoat_balance)
        let alice_pMoat_exercise = await _pMoat.exercise(alice_pMoat_balance, {from: Alice})
        
        console.log(lock_book)
        let bob_strike_balance = (await STK.balanceOf(Bob, {from: Bob})).toString()
        let bob_cMoat_balance = (await _cMoat.balanceOf(Bob, {from: Bob})).toString()
        let bob_cMoat_approve = await STK.approve(cMoat_address, (bob_strike_balance), {from: Bob})
        console.log('bob cmoat bal ', bob_cMoat_balance)
        let bob_cMoat_exercise = await _cMoat.exercise(bob_cMoat_balance, {from: Bob})


        /*
            @dev Verify Exercise
        */


        assert.strictEqual((await _cMoat.balanceOf(Bob, {from: Bob})).toString(), '0', 'MOAT Tokens should have been exercised.')
        assert.strictEqual((await _pMoat.balanceOf(Alice, {from: Alice})).toString(), '0', 'MOAT Tokens should have been exercised.')


        // Information update
        await getLockBook('Should be withdrawn from DEX', _cMoat, _pMoat)
        await getLedger('Exercise and Close MOATs', STK, UDR, _cMoat, _pMoat)
        await getDexLedger('All tokens withdrawn from DEX', STK, UDR, _cMoat, _pMoat, odex)


        // Log
        console.log(ledger)
        console.log(gas)
    });


})