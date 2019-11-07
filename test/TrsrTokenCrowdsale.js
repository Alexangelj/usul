const assert = require('assert').strict;

const TrsrToken = artifacts.require('TrsrToken');
const TrsrTokenCrowdsale = artifacts.require('TrsrTokenCrowdsale');

contract('TrsrTokenCrowdsale', accounts => {

    // Variables to test with
    let admin = accounts[0];
    let purchaser = accounts[1];
    let _tokenAmount = 100000;
    let _tokenPrice = 1000000000000000; // in wei

    it('Gives contract correct beginning balance.', async () => {
        let sale_instance = await TrsrTokenCrowdsale.deployed();
        let token_instance = await TrsrToken.deployed();
        await token_instance.transfer(sale_instance.address, _tokenAmount, { from: admin });
        let contract_balance = await token_instance.balanceOf(sale_instance.address);
        assert.equal(contract_balance.toNumber(), _tokenAmount, 'Contract balance does not equal deployed amt.');
    });


    it('Initializes crowdsale contract with correct values.', async () => {
        let sale_instance = await TrsrTokenCrowdsale.deployed();
        let address = await sale_instance.address;
        let address_token = await sale_instance.trsrContract();
        let sale_token_price = await sale_instance.trsrPrice();
        assert.notEqual(address, 0x0, 'Has a contract address.');
        assert.notEqual(address_token, 0x0, 'Has a contract address.');
        assert.equal(sale_token_price.toNumber(), _tokenPrice, 'Does not have correct token price.');
    });


    it('Ability to purchase tokens.', async () => {
        let token_instance = await TrsrToken.deployed(); 
        let sale_instance = await TrsrTokenCrowdsale.deployed();
        let purchase_amount = 10;
        let sale_token_price = await sale_instance.trsrPrice();
        let purchase = await sale_instance.purchaseTrsrToken(purchase_amount, 
            { from: purchaser, value: purchase_amount * sale_token_price });
        let sold_amount = await sale_instance.trsrSold();
        let purchaser_balance = (await token_instance.balanceOf(purchaser)).toNumber();
        let contract_balance = (await token_instance.balanceOf(sale_instance.address)).toNumber();
        assert.equal(sold_amount.toNumber(), purchase_amount, 'Should purchase purchase amount of tokens.');
        assert.equal(purchase.logs.length, 1, 'Triggers a single event.');
        assert.equal(purchase.logs[0].event, 'TokensPurchased', 'Trigger the TokensPurchased event.');
        assert.equal(purchase.logs[0].args._purchaser, purchaser, 'Account purchaser should match purchaser on logs.');
        assert.equal(purchase.logs[0].args._amount.toNumber(), purchase_amount, 'Purchase amt should match amt on logs.');
        assert.equal(purchaser_balance, purchase_amount, 'Purchaser should have a balance = purchase amt.');
        assert.equal(contract_balance, _tokenAmount - purchase_amount, 'Contract bal should subtract purchase amt.');
 
        // Check for errors with purchasing more than in contract balance
        try {
            await sale_instance.purchaseTrsrToken(_tokenAmount + 1, { from: purchaser, value: purchase_amount * sale_token_price});
        } catch (err) {
            assert(err.message.indexOf('revert') >= 0, 'Invalid: cannot buy more tokens than in contract balance');
        }

        try {
            await sale_instance.purchaseTrsrToken(purchase_amount, { from: purchaser, value: 1 });
        } catch (err) {
            assert(err.message.indexOf('revert') >= 0, 'Invalid: purchase amt should be in wei');
        }
    });


    it('Finalizes crowdsale.', async () => {
        let token_instance = await TrsrToken.deployed(); 
        let sale_instance = await TrsrTokenCrowdsale.deployed();
        let function_caller = sale_instance.end
        let purchase_amount = 10;
        let end_contract_bal = _tokenAmount - purchase_amount;
        // Check that function caller is admin
        try {
            await sale_instance.finalizeSale({ from: purchaser});
        } catch (err) {
            assert(err.message.indexOf('revert') >= 0, 'Invalid: finalize sale must be called by admin');
        }

        // Check remaining contract balance was sent to admin
        await sale_instance.finalizeSale({ from: admin });
        let admin_balance = await token_instance.balanceOf(admin);
        assert.equal(admin_balance.toNumber(), end_contract_bal, 'Should have all tokens transferred to admin balance');

        // Assert contract has no balance
        let contract_balance = await web3.eth.getBalance(sale_instance.address)
        assert.equal(contract_balance, '0', 'Contract balance does not equal 0.');
    });

})