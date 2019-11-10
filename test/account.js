const assert = require('assert').strict;
const AccountFactory = artifacts.require('AccountFactory')
const Account = artifacts.require('Account')
const ECOFactory = artifacts.require('ECOFactory')
const ECO = artifacts.require('ECO')

contract('Account Testing', accounts => {
    

    it('Creates Account Factory Contract', async () => {
        console.log('\n')
        let fac = await AccountFactory.deployed()
        console.log('fac: ', fac.address)
    });

    it('Creates New User Account', async () => {
        console.log('\n')
        let fac = await AccountFactory.deployed()
        let user_addr = accounts[0]
        let acc = await fac.createAccount(user_addr)
        console.log('user: ', acc.logs[0].args.user)
        console.log('acc: ', acc.logs[0].args.userAcc)
        assert.strictEqual(acc.logs[0].args.user, user_addr, 'Account not created by user address')
    });

    it('Creates Second User Account', async () => {
        console.log('\n')
        let fac = await AccountFactory.deployed()
        let user_addr = accounts[1]
        let acc = await fac.createAccount(user_addr)
        console.log('user: ', acc.logs[0].args.user)
        console.log('acc: ', acc.logs[0].args.userAcc)
        assert.strictEqual(acc.logs[0].args.user, user_addr, 'Account not created by user address')
    });

    it('Can Access Users and their Accounts', async () => {
        console.log('\n')
        let fac = await AccountFactory.deployed()
        let buyer = accounts[1]
        let seller = accounts[0]
        let buyerAcc = await fac.getAccount(buyer)
        let sellerAcc = await fac.getAccount(seller)
        let _buyer = await fac.getUser(buyerAcc)
        let _seller = await fac.getUser(sellerAcc)
        console.log('buyer: ', _buyer)
        console.log('buyer acc: ', buyerAcc)
        console.log('seller: ', _seller)
        console.log('seller acc: ', sellerAcc)
    });


    it('Can Authorize Accounts and Check Authorized Accounts', async () => {
        console.log('\n')
        let fac = await AccountFactory.deployed()
        let buyer = accounts[1]
        let seller = accounts[0]
        let buyerAcc = await fac.getAccount(buyer)
        let sellerAcc = await fac.getAccount(seller)
        let _buyer = await fac.getUser(buyerAcc)
        let _seller = await fac.getUser(sellerAcc)
        let acc = await Account.at(sellerAcc)
        
        let auth_seller = await acc.authorize(sellerAcc)
        let auth_seller_address = await auth_seller.receipt.logs[0].args.userAcc
        console.log('self.factory: ', auth_seller.receipt.logs[0].args.user)
        console.log('authed address: ', auth_seller_address)
        
        let authed_seller = await acc.authorizedAccount(sellerAcc)
        assert.strictEqual(authed_seller, true, 'Seller Acc must be Automaticall Authed')
        console.log('seller Acc: ', sellerAcc)
        console.log('authed address bool: ', authed_seller)

        let sellerAcc_user = await fac.getUser(auth_seller_address)
        assert.strictEqual(sellerAcc_user, seller, 'Should be same seller user')
        console.log('seller user ', sellerAcc_user)

        console.log('*** Not Authed ***')
        let not_authed = await acc.authorizedAccount(buyerAcc)
        assert.strictEqual(not_authed, false, 'Buyer acc has been authed')
        console.log('buyer Acc: ', buyerAcc)
        console.log('not authed address bool: ', not_authed)

        console.log('*** Authorizing ***')
        let auth_buyer = await acc.authorize(buyerAcc)
        let auth_buyer_address = await auth_buyer.receipt.logs[0].args.userAcc
        console.log('authed address: ', auth_buyer_address)

        let authed_buyer = await acc.authorizedAccount(buyerAcc)
        assert.strictEqual(authed_buyer, true, 'Seller Acc must be Automaticall Authed')
        console.log('buyer Acc: ', buyerAcc)
        console.log('authed address bool: ', authed_buyer)

        let buyerAcc_user = await fac.getUser(auth_buyer_address)
        assert.strictEqual(buyerAcc_user, buyer, 'Should be same buyer user')
        console.log('buyer user ', buyerAcc_user)

    });


    it('Can Deposit Funds', async () => {
        console.log('\n')
        let fac = await AccountFactory.deployed()
        let buyer = accounts[1]
        let seller = accounts[0]
        let buyerAcc = await fac.getAccount(buyer)
        let sellerAcc = await fac.getAccount(seller)
        let _buyer = await fac.getUser(buyerAcc)
        let _seller = await fac.getUser(sellerAcc)
        let acc = await Account.at(sellerAcc)

        let amount = 1*10**18 //in wei
        let wei = 10**18

        let seller_user_bal = await web3.eth.getBalance(_seller)
        console.log('SUSER Bal: ', seller_user_bal / wei)

        let deposit = await acc.deposit(sellerAcc, {from: seller, value: amount})
        console.log('SUSER DEPOSIT\n')

        let seller_user_bal_after = await web3.eth.getBalance(_seller)
        console.log('SUSER Bal After: ', seller_user_bal_after / wei)
        console.log('DELTA Bal: ', (seller_user_bal - seller_user_bal_after) / wei)

        let addr = await acc.address
        let bal = await web3.eth.getBalance(acc.address)
        
        //console.log('deposit: ', deposit)
        console.log('deposit call from: ', deposit.receipt.from)
        console.log('deposit call to: ', deposit.receipt.to)
        console.log('deposit event: ', deposit.receipt.logs[0].event)
        console.log('deposit amount: ', deposit.receipt.logs[0].args.amount.toString() / wei)
        console.log('SACCOUNT Address: ', addr)
        console.log('REAL  SACCOUNT ', sellerAcc)
        console.log('SUSER Bal: ', seller_user_bal / wei)
        console.log('SACCOUNT Bal: ', bal / wei)

    });
    
    
    it('Can Withdraw Funds', async () => {
        console.log('\n')
        let fac = await AccountFactory.deployed()
        let buyer = accounts[1]
        let seller = accounts[0]
        let buyerAcc = await fac.getAccount(buyer)
        let sellerAcc = await fac.getAccount(seller)
        let acc = await Account.at(sellerAcc)
        let addr = await acc.address
        let bal = await web3.eth.getBalance(acc.address)
        let amount = 1*10**18 //in wei
        let wei = 10**18

        let withdraw = await acc.withdraw(sellerAcc, bal + 1)
        console.log('*** Attempt Withdraw > Balance ***')
        console.log('withdraw: ', withdraw.receipt.logs[0].args.message)
        assert.strictEqual(withdraw.receipt.logs[0].args.message, 'Exceeds balance', 'Cannot withdraw more than balance')

        let bal_after = await web3.eth.getBalance(acc.address)
        console.log('SACCOUNT Bal after: ', bal_after / wei)

        let user_bal = await web3.eth.getBalance(seller)
        let withdrawal = await acc.withdraw(sellerAcc, bal)
        console.log('*** Withdraw < Balance ***')
        console.log('seller Account: ', sellerAcc)
        console.log('withdrawal from: ', withdrawal.receipt.to) // sends tx TO contract to withdraw from
        console.log('seller: ', seller)
        console.log('withdrawal to: ', withdrawal.receipt.from) // sends tx FROM contract to withdraw to
        console.log('Bal Before Withdraw: User ', user_bal / wei)
        console.log('Bal Before Withdraw: Account ', bal_after / wei)
        console.log('withdrawal: ', withdrawal.receipt.logs[0].args.amount.toString() / wei)
        assert.strictEqual(withdrawal.receipt.to, sellerAcc.toLowerCase(), 'Tx to Seller Acc should match')
        assert.strictEqual(withdrawal.receipt.from, seller.toLowerCase(), 'Seller and tx from should match')
        assert.strictEqual(withdrawal.receipt.logs[0].args.amount.toString() / wei, 1, 'Amount should be withdraw amount')
        assert.strictEqual(bal_after / wei, amount / wei, 'Balance Should be amount deposited')
        assert.strictEqual(withdrawal.receipt.logs[0].event, 'AccountWithdrawal', 'Should trigger AccountWithdrawal event')
        
        let bal_withdraw = await web3.eth.getBalance(acc.address)
        let user_bal_withdraw = await web3.eth.getBalance(seller)
        console.log('Bal After Withdraw: Account ', bal_withdraw / wei)
        console.log('Bal After Withdraw: User ', user_bal_withdraw / wei)
        //assert.strictEqual(bal_withdraw / wei, bal, 'Balance should subtract amount')

    });

})

