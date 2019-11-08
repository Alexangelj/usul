const assert = require('assert').strict;
const AccountFactory = artifacts.require('AccountFactory')
const Account = artifacts.require('Account')

contract('Account Testing', accounts => {


    it('Creates Account Factory Contract', async () => {
        let fac = await AccountFactory.deployed()
        console.log('fac: ', fac.address)
    });

    it('Creates New User Account', async () => {
        let fac = await AccountFactory.deployed()
        let user_addr = accounts[0]
        let acc = await fac.createAccount(user_addr)
        console.log('user: ', acc.logs[0].args.user)
        console.log('acc: ', acc.logs[0].args.userAcc)
        assert.strictEqual(acc.logs[0].args.user, user_addr, 'Account not created by user address')
    });

    it('Creates Second User Account', async () => {
        let fac = await AccountFactory.deployed()
        let user_addr = accounts[1]
        let acc = await fac.createAccount(user_addr)
        console.log('user: ', acc.logs[0].args.user)
        console.log('acc: ', acc.logs[0].args.userAcc)
        assert.strictEqual(acc.logs[0].args.user, user_addr, 'Account not created by user address')
    });

    it('Can Access Users and their Accounts', async () => {
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
        let fac = await AccountFactory.deployed()
        let buyer = accounts[1]
        let seller = accounts[0]
        let buyerAcc = await fac.getAccount(buyer)
        let sellerAcc = await fac.getAccount(seller)
        let _buyer = await fac.getUser(buyerAcc)
        let _seller = await fac.getUser(sellerAcc)
        let acc = await Account.deployed()
        
        let auth_seller = await acc.authorize(sellerAcc)
        let auth_seller_address = await auth_seller.receipt.logs[0].args.userAcc
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
        let fac = await AccountFactory.deployed()
        let buyer = accounts[1]
        let seller = accounts[0]
        let buyerAcc = await fac.getAccount(buyer)
        let sellerAcc = await fac.getAccount(seller)
        let _buyer = await fac.getUser(buyerAcc)
        let _seller = await fac.getUser(sellerAcc)
        let acc = await Account.deployed()

        let amount = 1 //in wei

        let seller_user_bal = await web3.eth.getBalance(_seller)
        console.log('seller user balance: ', seller_user_bal)
        
        let deposit = await acc.deposit(amount, sellerAcc)
        await acc.send(amount, {from: seller})
        console.log('deposit made from seller user')
        console.log('seller user balance: ', seller_user_bal)
        
        let addr = await acc.address
        let bal = await acc.accountBalance()
        
        console.log('acc from: ', deposit.receipt.from)
        console.log('deposit event: ', deposit.receipt.logs[0].event)
        console.log('deposit args: ', deposit.receipt.logs[0].args)
        console.log('seller acc address: ', addr)
        console.log('actual seller acc address: ', sellerAcc)
        console.log('seller user balance: ', seller_user_bal)
        console.log('seller Acc balance: ', bal.toNumber())
        
    });
    
    
    it('Can Withdraw Funds', async () => {
        let acc = await Account.deployed()
    });

})

