const assert = require('assert').strict;
const ECO = artifacts.require('ECO')
const ECOFactory = artifacts.require('ECOFactory')
const Account = artifacts.require('Account')
const AccountFactory = artifacts.require('AccountFactory')
var _strike = 1
var _buyer = '0xE64aF0A0D319fb613983BB1D00A2baFfEAF1aBE9' // accounts[1]
var _seller = '0x9995d8026d970db26C8de1553957f670C2C5707b' // accounts[0]
var _notional = 100

contract('ECO', accounts => {


    it('Creates ECO Factory Contract', async () => {
        console.log('\n')
        let eco_fac = await ECOFactory.deployed()
        console.log('fac: ', eco_fac.address)
    });


    it('Creates New ECO', async () => {
        console.log('\n')
        let acc_fac = await AccountFactory.deployed()
        let buyer = accounts[1]
        let seller = accounts[0]
        let vendee_create = await acc_fac.createAccount(buyer)
        let vendor_create = await acc_fac.createAccount(seller)
        let vendee = await acc_fac.getAccount(buyer)
        let vendor = await acc_fac.getAccount(seller)
        
        let wei = 10**18
        let strike = 1
        let notional = 10
        let maturity = 10
        
        var params = [
            ['buyer: ', buyer],
            ['vendee: ', vendee],
            ['seller: ', seller],
            ['vendor: ', vendor],
            ['strike: ', strike],
            ['notional: ', notional],
            ['maturity: ', maturity]
        ]
        
        let eco_fac = await ECOFactory.deployed()
        let eco = await eco_fac.createEco(  buyer,
                                            vendee, 
                                            seller, 
                                            vendor, 
                                            strike, 
                                            notional, 
                                            maturity,
                                            {value: notional*2*10**18}
                                            )
        console.log('*** PARAMETERS ***\n')
        for (var i = 0; i < params.length; i++){
            console.log(params[i][0], params[i][1])
        }
        var event = [
            'eco: ',
            'buyer: ',
            'vendee: ',
            'strike: ',
            'notional: ',
            'maturity: '
        ]
        for (var i = 0; i < eco.logs[0].args.__length__; i++){
            console.log(event[i], eco.logs[0].args[i])
        }
        assert.strictEqual(eco.logs[0].args.buyer, buyer, 'buyer should be buyer in eco')
    });


    it('Can Access All Parties', async () => {
        console.log('\n')
        let eco_fac = await ECOFactory.deployed()
        let buyer = accounts[1]
        let seller = accounts[0]
        let eco = await eco_fac.getEco(buyer)
        let _eco = await eco_fac.getEco(seller)
        let vendee = await eco_fac.getAccount(buyer, eco)
        let vendor = await eco_fac.getAccount(seller, _eco)
        let _buyer = await eco_fac.getUser(vendee)
        let _seller = await eco_fac.getUser(vendor)
        
        
        let addresses = [
            ['buyer: ', buyer],
            ['seller: ', seller],
            ['eco: ', eco],
            ['_eco: ', _eco],
            ['vendee: ', vendee],
            ['vendor: ', vendor],
            ['_buyer: ', _buyer],
            ['_seller: ', _seller],
            
        ]

        for(var i = 0; i < addresses.length; i++) {
            console.log(addresses[i][0], addresses[i][1])
        }
        assert.strictEqual(_buyer, buyer, 'Buyers should be equal')
        assert.strictEqual(_seller, seller, 'Sellers shold be equal')
    });

    // End tests for Factory Functionality, 
    // Tests for ECO Functionality:

    it('Authorizes the ECO to use Account', async () => {
        let eco_fac = await ECOFactory.deployed()
        let buyer = accounts[1]
        let seller = accounts[0]
        let eco_address = await eco_fac.getEco(buyer)
        let _eco = await ECO.at(eco_address)
        let auth_or = await _eco.authorizeAccounts()
        let auth_ee = await _eco.authorizeAccounts({ from: buyer })

        var args = [
            'Vendee/Vendor: ',
            'ECO Contract: ',
            'Authed: ',
        ]
        for(var i = 0; i < auth_or.receipt.logs[0].args.__length__; i++) {
            console.log(args[i], auth_or.receipt.logs[0].args[i])
        }
        for(var i = 0; i < auth_ee.receipt.logs[0].args.__length__; i++) {
            console.log(args[i], auth_ee.receipt.logs[0].args[i])
        }
        assert.strictEqual(auth_ee.receipt.from, buyer.toLowerCase(), 'Buyer should also be authed')
        assert.strictEqual(auth_or.receipt.from, seller.toLowerCase(), 'Seller should be authed')
        assert.strictEqual(auth_ee.receipt.logs[0].args.eco, eco_address, 'Should be authed for same ECO address')
        assert.strictEqual(auth_or.receipt.logs[0].args.eco, eco_address, 'Should be authed for same ECO address')
        
        let vendee = await eco_fac.getAccount(buyer, eco_address)
        let vendor = await eco_fac.getAccount(seller, eco_address)
        let acc_ee = await Account.at(vendee)
        let acc_or = await Account.at(vendor)
        
        console.log('*** Access Authed Mapping ***')
        let authed_ee = await acc_ee.authorizedAccount(vendee)
        let authed_or = await acc_or.authorizedAccount(vendor)

        var authed_array = [
            ['Vendee: ', vendee],
            ['Authed Vendee', authed_ee],
            ['Vendor: ', vendor],
            ['Authed Vendor: ', authed_or]
        ]
        for(var i=0; i<authed_array.length;i++){console.log(authed_array[i][0], authed_array[i][1])}
    });


    it('Validates the Emerald Call Option', async () => {
        let eco_fac = await ECOFactory.deployed()
        let buyer = accounts[1]
        let seller = accounts[0]
        let eco_address = await eco_fac.getEco(buyer)
        let _eco = await ECO.at(eco_address)
        let validate = await _eco.validate()

        let args = [
            'Eco: ',
            'Vendee: ',
            'Vendor: ',
            'Validated: ' 
        ]
        let logs = await validate.logs[0].args
        for(var i=0;i<logs.__length__;i++){console.log(args[i], logs[i])}
        assert.strictEqual(logs.eco, eco_address, 'Should have same ECO address')
        assert.strictEqual(logs.outcome, true, 'Should return true')
    });

    it('Checks Exercise Conditions, Disperses Cash Flows and Settles', async () => {
        let eco_fac = await ECOFactory.deployed()
        let buyer = accounts[1]
        let seller = accounts[0]
        let eco_address = await eco_fac.getEco(buyer)
        let _eco = await ECO.at(eco_address)
        let exercise_seller = await _eco.exercise()
        let logs = await exercise_seller.receipt.logs[0]
        let vendee = await eco_fac.getAccount(buyer, eco_address)
        let vendor = await eco_fac.getAccount(seller, eco_address)
        await web3.eth.sendTransaction({from: seller, to: _eco.address, value: 20*10**18})
        let strike = 1*10**18
        let notional = 10
        let underlier = 2*10**18
        console.log('Exercise from seller: ', logs.event)
        assert.strictEqual(logs.event, 'Error', 'Should not be able to exercise as Seller')
        //let exercise_buyer = await _eco.exercise({from: buyer})
        //let _logs = await exercise_buyer.receipt.logs[0]
        //assert.strictEqual(_logs.args.outcome, true, 'Should be able to exercise as buyer')
        //assert.strictEqual(exercise_buyer.receipt.logs[1].args.message, 'Exceeds balance', 'Should not withdraw from unfunded Account')

        console.log('*** Balances of Accounts Before ***')
        async function checkBalances(){
            var bal_before = [
                'Buyer: ',
                'Vendor: ',
                'Seller: ',
                'Vendee: ',
                'ECO: ',
            ]
            var acc_list = [
                buyer,
                vendor,
                seller,
                vendee,
                _eco.address,
            ]
            for(var i = 0; i < acc_list.length; i++) {
                console.log(bal_before[i], await web3.eth.getBalance(acc_list[i])/10**18)
            }
        }
        await checkBalances()
        console.log('*** Fund Vendor ***')
        let event_args = [
            'Funds From: ',
            'Vendor/Vendee: ',
        ]
        let acc_or = await Account.at(vendor)
        let acc_ee = await Account.at(vendee)
        let capital = 20*10**18
        let strk = 10*10**18
        let fund_or = await acc_or.deposit(vendor, {value: capital})
        let logs_or = await fund_or.receipt.logs[0]
        console.log('Event: ', logs_or.event)
        for(var i=0;i<logs_or.args.__length__-2;i++){console.log(event_args[i], logs_or.args[i])}
        console.log('Value: ', logs_or.args.amount.toString()/10**18)
        let bal_ee = await web3.eth.getBalance(vendor)/10**18
        console.log('Vendor Balance: ', bal_ee)
        console.log('*** Fund Vendee ***')
        let fund_ee = await acc_ee.deposit(vendee, {from: buyer, value: capital})
        let logs_ee = await fund_ee.receipt.logs[0]
        console.log('Event: ', logs_ee.event)
        for(var i=0;i<logs_ee.args.__length__-2;i++){console.log(event_args[i], logs_ee.args[i])}
        console.log('Value: ', logs_ee.args.amount.toString()/10**18)
        let bal_or = await web3.eth.getBalance(vendor)/10**18
        console.log('Vendee Balance: ', bal_or)
        
        assert.strictEqual(bal_or, capital/10**18, 'Bal should be equal to capital for vendor')
        assert.strictEqual(bal_ee, capital/10**18, 'Bal should be equal to capital for vendee')

        console.log('*** Check Account Balances After ***')
        await checkBalances()
        
        //let fund_or_exercise = await _eco.exercise({from: buyer})
        console.log('vendor: ', vendor)
        //let acc_vendor = await Account.at(vendor)
        //let exe = await acc_vendor.exerciseContract()
        //console.log(exe)
        let fund_or_exercise = await _eco.exercise({from: buyer, value: strk})
        let vendor_exercise_logs = await fund_or_exercise.receipt.logs[1]
        //console.log(fund_or_exercise.receipt)
        //console.log(fund_or_exercise.receipt.logs[0].args)
        //console.log(vendor_exercise_logs)
        await checkBalances()
    });


    it('Disperses Cash Flows and Settles', async () => {
        
    });
})