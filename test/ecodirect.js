const assert = require('assert').strict;
const ECO = artifacts.require('ECO')
const ECOFactory = artifacts.require('ECOFactory')
const ECOPriceOracle = artifacts.require('ECOPriceOracle')

contract('ECO', accounts => {
    var buyer = accounts[1]
    var seller = accounts[0]
    var strk = 1 // in uint256
    var strike = web3.utils.toWei(strk.toString(), 'ether') // strike in wei (ether)
    var notional = 2 // uint256 this is amount the contract handles
    var maturity = 10 // time in seconds?
    var margin_multiplier = 3 // 300% margin for a 150% covered call option writer
    var margin_deposit = strk * notional * margin_multiplier // uint256 required margin from writer
    var margin = web3.utils.toWei(margin_deposit.toString(), 'ether') // margin in wei (ether)
    var underlying = 2
    var underlying_value = underlying * notional
    var underlying_value_wei = web3.utils.toWei(underlying_value.toString(), 'ether')
    var premium_multipler = 0.1
    var premium = strk * premium_multipler
    var premium_wei = web3.utils.toWei(premium.toString(), 'ether')
    var strike_value = strk * notional
    var strike_value_wei = web3.utils.toWei(strike_value.toString(), 'ether')
    var wei = 10**18

    it('Creates ECO Factory Contract', async () => {
        console.log('\n')
        let eco_fac = await ECOFactory.deployed()
        console.log('fac: ', eco_fac.address)
    });

    it('Creates New ECO', async () => {
        console.log('\n')
        var params = [
            ['buyer: ', buyer],
            ['seller: ', seller],
            ['strike: ', strike],
            ['notional: ', notional],
            ['maturity: ', maturity],
            ['margin: ', margin]
        ]
        let eco_fac = await ECOFactory.deployed()
        let eco = await eco_fac.createEco(  buyer,
                                            seller,  
                                            strike, 
                                            notional, 
                                            maturity,
                                            margin
                                            )
        let eco_address = await eco_fac.getEco(buyer)
        console.log('*** PARAMETERS ***\n')
        for (var i = 0; i < params.length; i++){
            console.log(params[i][0], params[i][1])
        }
        var args = [
            ['eco: ', eco_address],
            ['buyer: ', buyer],
            ['strike: ', strike],
            ['notional: ', notional],
            ['maturity: ', maturity],
            ['margin: ', margin],
            ['Oracle Address: ']
        ]
        for (var i = 0; i < eco.logs[0].args.__length__; i++){
            console.log(args[i][0], eco.logs[0].args[i])
        }
        for (var i = 0; i < eco.logs[0].args.__length__-1; i++){
            assert.strictEqual((eco.logs[0].args[i]).toString(), args[i][1].toString(), 'Params incorrect')
        }
    });


    it('Checks Oracle Functionality', async () => {
        console.log('\n')
        let eco_fac = await ECOFactory.deployed()
        let eco_address = await eco_fac.getEco(buyer)
        let _eco = await ECO.at(eco_address)
        let oracle_address = await _eco.oracle_address.call()
        //let spot = await _eco.getSpotPrice()
        //console.log('SPOT PRICE: ', spot)
    });


    it('Authorizes the ECO to use Account', async () => {
        let eco_fac = await ECOFactory.deployed()
        let eco_address = await eco_fac.getEco(buyer)
        let _eco = await ECO.at(eco_address)
        let oracle = await ECOPriceOracle.deployed()
        console.log('Oracle address: ', oracle.address)
        //console.log('ORACLE SPOT PRICE: ', oracle)

        async function checkBalances(){
            var bal_before = [
                'Buyer: ',
                'Seller: ',
                'ECO: ',
            ]
            var acc_list = [
                buyer,
                seller,
                _eco.address,
            ]
            for(var i = 0; i < acc_list.length; i++) {
                console.log(bal_before[i], await web3.eth.getBalance(acc_list[i])/10**18)
            }
        }
        let auth_or = await _eco.write({value: margin})
        let auth_ee = await _eco.purchase({ from: buyer, value: premium_wei })

        var args = [
            'Buyer/Seller: ',
            'ECO Contract: ',
            'Authed: ',
        ]
        for(var i = 0; i < auth_or.receipt.logs[0].args.__length__; i++) {
            console.log(args[i], auth_or.receipt.logs[0].args[i])
        }
        for(var i = 0; i < auth_ee.receipt.logs[0].args.__length__; i++) {
            console.log(args[i], auth_ee.receipt.logs[0].args[i])
        }
        checkBalances()
    });

    it('Validates the Emerald Call Option', async () => {
        let eco_fac = await ECOFactory.deployed()
        let eco_address = await eco_fac.getEco(buyer)
        let _eco = await ECO.at(eco_address)
        
        let validate = await _eco.validate()

        let args = [
            ['Eco: ', eco_address],
            ['Buyer: ', buyer],
            ['Seller: ', seller],
            ['Validated: ', true],
        ]
        let logs = await validate.logs[1].args
        for(var i=0;i<logs.__length__;i++){
            console.log(args[i][0], logs[i])
            assert.strictEqual(logs[i], args[i][1], 'Should have same parameters')
        }
    });

    it('Exercises the Contract and Divests Balance', async () => {
        let eco_fac = await ECOFactory.deployed()
        let eco_address = await eco_fac.getEco(buyer)
        let _eco = await ECO.at(eco_address)
        async function checkBalances(){
            var bal_before = [
                'Buyer: ',
                'Seller: ',
                'ECO: ',
            ]
            var acc_list = [
                buyer,
                seller,
                _eco.address,
            ]
            for(var i = 0; i < acc_list.length; i++) {
                console.log(bal_before[i], await web3.eth.getBalance(acc_list[i])/10**18)
            }
        }

        let cashflow = [
            'To User: ',
            'From ECO: ',
            'Amount: ',
            'Outcome: '
        ]

        let exercise_seller = await _eco.exercise()
        assert.strictEqual(exercise_seller.receipt.logs[0].event, 'Error', 'Cannot exercise as seller')

        console.log('*** Should have a net difference of: ', (underlying * notional - strk * notional))
        await checkBalances()
        let exercise = await _eco.exercise({from: buyer, value: strike_value_wei})
        await checkBalances()

        for(var i = 0; i<4;i++){console.log(cashflow[i], (exercise.receipt.logs[1].args[i]).toString())}
        for(var i = 0; i<4;i++){console.log(cashflow[i], (exercise.receipt.logs[2].args[i]).toString())}
        
        let mature = await _eco.isMature()
        console.log(mature.receipt.logs[0].args)
        console.log(mature.receipt.logs[0].args.stamp.toString())
    });

})