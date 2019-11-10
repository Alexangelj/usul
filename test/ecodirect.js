const assert = require('assert').strict;
const ECO = artifacts.require('ECO')
const ECOFactory = artifacts.require('ECOFactory')

contract('ECO', accounts => {


    it('Creates ECO Factory Contract', async () => {
        console.log('\n')
        let eco_fac = await ECOFactory.deployed()
        console.log('fac: ', eco_fac.address)
    });


    it('Creates New ECO', async () => {
        console.log('\n')
        let buyer = accounts[1]
        let seller = accounts[0]
        let strike = 10
        let notional = 10
        let maturity = 10
        let margin_multiplier = 1.5
        let margin_deposit = strike * notional * margin_multiplier
        let margin = await web3.utils.toWei(margin_deposit.toString(), 'Ether')
        
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
        ]
        for (var i = 0; i < eco.logs[0].args.__length__; i++){
            console.log(args[i], eco.logs[0].args[i])
        }
        for (var i = 0; i < eco.logs[0].args.__length__; i++){
            assert.strictEqual((eco.logs[0].args[i]).toString(), args[i][1].toString(), 'Params incorrect')
        }
    });

    it('Authorizes the ECO to use Account', async () => {
        let eco_fac = await ECOFactory.deployed()
        let buyer = accounts[1]
        let seller = accounts[0]
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
        let strike = 10
        let notional = 10
        let margin_multiplier = 1.5
        let margin_deposit = strike * notional * margin_multiplier
        let margin = await web3.utils.toWei(margin_deposit.toString(), 'Ether')
        let auth_or = await _eco.write({value: margin})
        let auth_ee = await _eco.purchase({ from: buyer, value: 3*10**18 })

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
        let buyer = accounts[1]
        let seller = accounts[0]
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
        let buyer = accounts[1]
        let seller = accounts[0]
        let eco_address = await eco_fac.getEco(buyer)
        let _eco = await ECO.at(eco_address)
        
        let strk = 10
        let underlying = 20
        let wei = 10**18

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

        console.log('*** Should have a net difference of: ', (underlying-strk))
        await checkBalances()
        let exercise = await _eco.exercise({from: buyer, value: strk*wei})
        await checkBalances()

        for(var i = 0; i<4;i++){console.log(cashflow[i], (exercise.receipt.logs[1].args[i]).toString())}
        for(var i = 0; i<4;i++){console.log(cashflow[i], (exercise.receipt.logs[2].args[i]).toString())}
        
        let mature = await _eco.isMature()
        console.log(mature.receipt.logs[0].args)
        console.log(mature.receipt.logs[0].args.stamp.toString())
    });

})