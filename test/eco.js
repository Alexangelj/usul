const assert = require('assert').strict;
const ECO = artifacts.require('ECO')
const ECOFactory = artifacts.require('ECOFactory')
const Account = artifacts.require('Account')
const AccountFactory = artifacts.require('AccountFactory')
var _strike = 10
var _buyer = '0xE64aF0A0D319fb613983BB1D00A2baFfEAF1aBE9' // accounts[1]
var _seller = '0x9995d8026d970db26C8de1553957f670C2C5707b' // accounts[0]
var _notional = 1000

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
                                            maturity
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
    });

})