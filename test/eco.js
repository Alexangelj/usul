const assert = require('assert').strict;
const ECO = artifacts.require('ECO');
const Account = artifacts.require('Account')
var _strike = 10
var _buyer = '0xE64aF0A0D319fb613983BB1D00A2baFfEAF1aBE9' // accounts[1]
var _seller = '0x9995d8026d970db26C8de1553957f670C2C5707b' // accounts[0]
var _notional = 1000
contract('ECO', accounts => {


    it('Creates Trading Accounts', async () => {
        let instance = await Account.deployed();
        console.log('BuyerAccount: ', instance.address)
        console.log('SellerAccount: ', instance.address)
        let eco = await ECO.deployed()
        let buy = await eco.buyerAcc()
        let sell = await eco.sellerAcc()
        console.log('Buyer Account from Eco: ', buy)
        console.log('Seller Account from Eco: ', sell)
        
    });


    it('Initializes contract with correct values.', async () => {
        let instance = await ECO.deployed();
        let strike = await instance.strike();
        let buyer = await instance._buyer();
        let buyerAcc = await instance.buyerAcc();
        let seller = await instance._seller();
        let sellerAcc = await instance.sellerAcc();
        let notional = await instance.notionalValue();
        console.log('Buyer: ', buyer)
        console.log('Seller: ', seller)
        assert.strictEqual(strike.toNumber(), _strike, 'Should be the same strike');
        assert.strictEqual(buyer, _buyer, 'Should be the buyer');
        assert.strictEqual(seller, _seller, 'Should be the same seller');
        assert.strictEqual(notional.toNumber(), _notional, 'Should be the same notional value');
    });


    it('Authorizes Trading Accounts', async () => {
        let instance = await ECO.deployed();
        let auth = await instance.authorizeAccount();
        assert.equal(auth.logs.length, 2, 'Triggers two auth events');
        assert.strictEqual(auth.logs[0].args.outcome, true, 'Vendee must be Authorized');
        assert.strictEqual(auth.logs[1].args.outcome, true, 'Vendor must be Authorized');
    });


    it('Validates the Option Contract', async () => {
        let instance = await ECO.deployed();
        let validate = await instance.validate();
        let contract_addr = instance.address;
        assert.equal(validate.logs.length, 1, 'Triggles one validate event');
        assert.strictEqual(validate.logs[0].args.outcome, true, 'Contract should be active');
        assert.strictEqual(validate.logs[0].args.owner, contract_addr, 'Should be contract address');
    });


    it('Exercises the Contract', async () => {
        let instance = await ECO.deployed();
        let buyerAcc = await instance.buyerAcc();
        //let exe = await instance.exercise({from: buyerAcc});
    });


    it('Disperses Cash Settlement', async () => {
        let instance = await ECO.deployed();
        
    });

})