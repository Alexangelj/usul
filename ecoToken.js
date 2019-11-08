const assert = require('assert').strict;

var _name = 'Emerald';
var _symbol = 'ECO';
var _decimals = 18;
var _totalSupply = 100000;

const ECOToken = artifacts.require('ECOToken');

contract('ECOToken', accounts => {
    

    it('Mints total supply upon deployment and gives it to administrator.', async () => {
        let instance = await ECOToken.deployed();
        let balance = await instance.totalSupply();
        let adminBalance = await instance.balanceOf(accounts[0]);
        assert.strictEqual(balance.toNumber(), _totalSupply, 'Must = 1,000,000.');
        assert.strictEqual(adminBalance.toNumber(), _totalSupply, 'Admin balance must equal supply balance on initialization');
    });


    it('Initializes contract with correct values.', async () => {
        let instance = await ECOToken.deployed();
        let name = await instance.name();
        let symbol = await instance.symbol();
        let decimals = await instance.decimals();
        assert.strictEqual(name, _name, 'Should be the same name');
        assert.strictEqual(symbol, _symbol, 'Should be same symbol');
        assert.strictEqual(decimals.toNumber(), _decimals, 'Should be same decimals');
    });


    it('Transfers value from admin to -> user using transfer() function.', async () => {
        // Get instance of deployed contract
        let instance = await ECOToken.deployed();
        let ecoToken = instance;
        let value = 100;
        let high_value = 55555555;

        // Name the users
        let admin_account = accounts[0];
        let user_account = accounts[1];

        // Get starting balances
        let balance = await ecoToken.balanceOf(admin_account);
        let admin_balance_start = balance.toNumber();
        balance = await ecoToken.balanceOf(user_account);
        let user_balance_start = balance.toNumber();

        // Transfer value
        let transfer_event = await ecoToken.transfer(user_account, value);

        // Get ending balances
        balance = await ecoToken.balanceOf(admin_account);
        let admin_balance_end = balance.toNumber();
        balance = await ecoToken.balanceOf(user_account);
        let user_balance_end = balance.toNumber();    

        // Assert starting balances +/- value transfer = ending balances
        assert.strictEqual(admin_balance_start, admin_balance_end + value, 'Not subtracting the correct value form starting balance.');
        assert.strictEqual(user_balance_start, user_balance_end - value, 'Not adding correct value to starting balance.');
        
        // Assert transfer event took place
        // console.log(transfer_event.logs[0]);
        assert.equal(transfer_event.logs.length, 1, 'Triggers a single event.');
        assert.equal(transfer_event.logs[0].event, 'Transfer', 'Should return Transfer event.');
        assert.equal(transfer_event.logs[0].args.source, admin_account, 'Logs the account from which the tokens are transferred from.');
        assert.equal(transfer_event.logs[0].args.to, user_account, 'Logs the account from which the tokens are transferred to.');
        assert.equal(transfer_event.logs[0].args.amount.toNumber(), value, 'Logs the amount of tokens transferred.');

        // Transfer value higher than balance
        try {
            await ecoToken.transfer(user_account, value);
        } catch (err) {
            assert(err.message.indexOf('revert') >= 0, 'Transferring more value than in balance.');
        }

        // Transfer signed integer
        try {
            await ecoToken.transfer(user_account, -50);
        } catch (err) {
            assert(err.message.indexOf('revert') >= 0, 'Transfering signed integers is an invalid input.');
        }

    });


    it('Approves tokens for delegated transfer.', async () => {
        // Approve an account
        let instance = await ECOToken.deployed();
        let address = accounts[1];
        let allowance_amt = 55;
        let approve_call = await instance.approve.call(address, allowance_amt);
        let approve_event = await instance.approve(address, allowance_amt);

        // Assert approval functions correctly
        assert.equal(approve_call, true, 'It does not return true.');
        assert.equal(approve_event.logs.length, 1, 'Triggers a single event.');
        assert.equal(approve_event.logs[0].event, 'Approval', 'Should trigger approval event.');
        assert.equal(approve_event.logs[0].args.owner, accounts[0], 'Authorized account should be account[0].');
        assert.equal(approve_event.logs[0].args.spender, accounts[1], 'Authorized spender should be accounts[1].');
        assert.equal(approve_event.logs[0].args.amount.toNumber(), allowance_amt, 'Should be equal to allowance amt.');

        // Set Allowance for an account to spend a spender's value.
        let allowance = await instance.allowance(accounts[0], address);

        // Assert allowance functions correctly.
        assert.equal(allowance.toNumber(), allowance_amt, 'Stores allowance for delegated transfer.');
    });


    it('Handles a delegated token transfer.', async () => {
        // Setup
        let instance = await ECOToken.deployed();
        let value = 100;
        let approved_value = 12;
        let user_account = accounts[2];
        let spending_account = accounts[3];
        let receiving_account = accounts[4];

        // Transfer some tokens into a new account, say accounts[2] = user_account
        await instance.transfer(user_account, value);

        // Approve an account spending_account to spend some token approved_value from user_account
        await instance.approve(spending_account, approved_value, { from: user_account });

        // Attempt to transfer more tokens than in spender's balance
        try {
            await instance.transferFrom(user_account, receiving_account, 7777777, { from: spending_account });
        } catch (err) {
            assert(err.message.indexOf('revert') >= 0, 'Invalid: doesnt revert the transaction.');
        }

        // Attempt to transfer more than approved amount
        try {
            await instance.transferFrom(user_account, receiving_account, approved_value + 1, { from: spending_account});
        } catch (err) {
            assert(err.message.indexOf('revert') >= 0, 'Invalid: doesnt revert transaction.');
        }
        // Get balances before transfer
        let user_balance = (await instance.balanceOf(user_account)).toNumber();
        let spending_balance = (await instance.balanceOf(spending_account)).toNumber();
        let receiving_account_balance = (await instance.balanceOf(receiving_account)).toNumber();

        // Transfer value within approved amount
        let approved_transfer = await instance.transferFrom(user_account, receiving_account, approved_value - 1, { from: spending_account});

        // Check logs to confirm they match
        assert.equal(approved_transfer.logs.length, 1, 'Triggers a single event.');
        assert.equal(approved_transfer.logs[0].event, 'Transfer', 'Should return Transfer event.');
        assert.equal(approved_transfer.logs[0].args.source, user_account, 'Logs the account from which the tokens are transferred from.');
        assert.equal(approved_transfer.logs[0].args.to, receiving_account, 'Logs the account from which the tokens are transferred to.');
        assert.equal(approved_transfer.logs[0].args.amount.toNumber(), approved_value - 1, 'Logs the amount of tokens transferred.');

        // Get balances after transfer
        let user_balance_end = (await instance.balanceOf(user_account)).toNumber();
        let spending_balance_end = (await instance.balanceOf(spending_account)).toNumber();
        let receiving_account_balance_end = (await instance.balanceOf(receiving_account)).toNumber();

        // Check balances to confirm they match
        assert.equal(user_balance_end, user_balance - approved_value + 1, 'Should deduct approved amount + 1 from sender account balance.');
        assert.equal(spending_balance_end, spending_balance, 'Should remain the same balance for account spending on behalf (delegated to).');
        assert.equal(receiving_account_balance_end, receiving_account_balance + approved_value - 1, 'Should add the approved amount - 1 to received account balance.');
        
    });


})