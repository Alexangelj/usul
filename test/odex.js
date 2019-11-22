const assert = require('assert').strict;
const Stk = artifacts.require('STK')
const Odex = artifacts.require('Odex')



contract('cMOat', accounts => {


    var writer = accounts[0]
    var purchaser = accounts[1]
    let decimals = 10**18
    var eth = (10*10**18).toFixed()
    var STK_deposit = (10*10**18).toFixed()
    var token_symbol = 'STK'
    var purchase_amount = (1*10**18).toFixed()
    var sell_amount = (1*10**18).toFixed()
    var gas = []

    async function getGas(func, name) {
        let spent = await func.receipt.gasUsed
        gas.push([name + ' gas: ', spent])
    }

    async function getBalances(STK, odex)  {
        let writer_eth = ((await web3.eth.getBalance(writer))/decimals).toFixed()
        console.log('writer Eth Balance: ', writer_eth)

        let writer_bal = ((await STK.balanceOf(writer))/decimals).toString()
        console.log('writer STK Balance: ', writer_bal)

        let writer_dex_bal = ((await odex.getTokenBalance(token_symbol))/decimals).toString()
        console.log('writer DEX Token Balance: ', writer_dex_bal)

        let writer_eth_dex_bal = ((await odex.ethBalances(writer))/decimals).toString()
        console.log('writer DEX Eth Balance: ', writer_eth_dex_bal)

        let purchaser_eth = ((await web3.eth.getBalance(purchaser))/decimals).toFixed()
        console.log('purchaser Eth Balance: ', purchaser_eth)

        let purchaser_bal = ((await STK.balanceOf(purchaser, {from: purchaser}))/decimals).toString()
        console.log('purchaser STK Balance: ', purchaser_bal)

        let purchaser_dex_bal = ((await odex.getTokenBalance(token_symbol, {from: purchaser}))/decimals).toString()
        console.log('purchaser DEX Token Balance: ', purchaser_dex_bal)

        let purchaser_eth_dex_bal = ((await odex.ethBalances(purchaser))/decimals).toString()
        console.log('purchaser DEX Eth Balance: ', purchaser_eth_dex_bal)
    }

    async function getEvents(e1) {
        for(var i = 0; i < (e1.receipt.logs[0].args.__length__); i++) { // for each argument
            console.log((e1.receipt.logs[0].args[i]).toString())
        }
    }

    async function eventNames(event){
        console.log((event.receipt.logs[0].event).toString())
    }

    it('Creates Odex Contract', async () => {
        console.log('\n')
        let odex = await Odex.deployed()
        console.log('Odex: ', odex.address)
    });


    it('Creates Token Contract', async () => {
        console.log('\n')
        let STK = await Stk.deployed()
        console.log('STK: ', STK.address)
        await STK.transfer(writer, STK_deposit, {from: purchaser})
        await STK.transfer(writer, STK_deposit, {from: purchaser})
        let user_bal = (await STK.balanceOf(writer)).toString()
        console.log('User STK Balance: ', user_bal)
    });

    it('Deposits and Withdraws Eth', async () => {
        console.log('\n')
        let odex = await Odex.deployed()
        let depositEth = await odex.depositEth({from: writer, value: eth})
        let withdrawEth = await odex.withdrawEth(eth, {from: writer})
        let depositEthToTrade = await odex.depositEth({from: writer, value: eth})
        let depositEthToTrade2 = await odex.depositEth({from: purchaser, value: eth})
    });

    it('Adds Token to DEX', async () => {
        console.log('\n')
        let STK = await Stk.deployed()
        let odex = await Odex.deployed()
        let add = await odex.addToken(token_symbol, STK.address)
        
        let args = add.receipt.logs[0].args
        console.log('Symbol Added: ', args._token)
        console.log('Index: ', (args._symbolIndex).toNumber())
        
        await getBalances(STK, odex)
    });


    it('Deposits Tokens into Dex', async () => {
        console.log('\n')
        let STK = await Stk.deployed()
        let odex = await Odex.deployed()
        let approve = await STK.approve(odex.address, STK_deposit)
        let deposit = await odex.depositToken(token_symbol, STK_deposit)

        let approve2 = await STK.approve(odex.address, STK_deposit)
        let approve3 = await STK.approve(odex.address, STK_deposit, {from: purchaser})
        let writer_deposit = await odex.depositToken(token_symbol, STK_deposit)
        let purchaser_deposit = await odex.depositToken(token_symbol, STK_deposit, {from: purchaser})

        
        let args = await deposit.receipt.logs[0].args
        console.log('Token Index: ', (args._symbolIndex).toString())
        console.log('Tokens Deposited: ', (args._amount_tokens).toString())
        
        await getBalances(STK, odex)
    });


    it('Withdraws Tokens from Dex', async () => {
        console.log('\n')
        let STK = await Stk.deployed()
        let odex = await Odex.deployed()
        let withdrawToken = await odex.withdrawToken(token_symbol, STK_deposit)
        
        let args = await withdrawToken.receipt.logs[0].args
        console.log('Token Index: ', (args._symbolIndex).toString())
        console.log('Tokens Withdrawn: ', (args._amount_tokens).toString())
        
        await getBalances(STK, odex)
    });


    // Initiates exchange
    // Writer is selling: 1:1ETH, 1:2ETH, 1:4ETH
    // Purchaser is buying: 1:1ETH, 1:2ETH, 1:4ETH 
    // Purchaser deposits 10 STK and 10 Eth to trade with
    // Writer deposits 10 STK and 10 Eth to trade
    // First, writer will put in a buy order for 1 token at 1 ether
    // Second, purchaser will put in a sell order for 1 token at 2 ether
    // Third, purchaser will put in another sell order for 1 token at 4 ether
    // Fourth, writer will put in a buy order for 1 token at 2 ether
    // Fifth, writer will put in a buy order for 1 token at 4 ether
    // Sixth, purchaser will put in a sell order for 1 token at 1 ether
    // Writer purchases 3 tokens for a total of 4+2+1 = 7 Ether
    // Purchaser sells 3 tokens for a total of 4+2+1 = 7 Ether
    
    it('Exchange', async () => {
        console.log('\n')
        let STK = await Stk.deployed()
        let odex = await Odex.deployed()
        // First, writer will put in a buy order for 1 token at 1 ether
        let purchase = await odex.buyToken(token_symbol, (10**18).toFixed(), purchase_amount)
        // Second, purchaser will put in a sell order for 1 token at 2 ether
        let sell2 = await odex.sellToken(token_symbol, (2*10**18).toFixed(), sell_amount, {from: purchaser})
        let sell4 = await odex.sellToken(token_symbol, (2*10**18).toFixed(), sell_amount, {from: purchaser})
        // Third, purchaser will put in another sell order for 1 token at 4 ether
        let sell3 = await odex.sellToken(token_symbol, (4*10**18).toFixed(), sell_amount, {from: purchaser})
        // Fourth, writer will put in a buy order for 1 token at 2 ether
        let purchase2 = await odex.buyToken(token_symbol, (2*10**18).toFixed(), purchase_amount)
        // Fifth, writer will put in a buy order for 1 token at 4 ether
        let purchase3 = await odex.buyToken(token_symbol, (4*10**18).toFixed(), purchase_amount)
        // Sixth, purchaser will put in a sell order for 1 token at 1 ether
        let sell = await odex.sellToken(token_symbol, (10**18).toFixed(), sell_amount, {from: purchaser})
        // Get gas usage
        let sell_gas = await sell.receipt.gasUsed
        console.log('sell Gas Internal: ', sell_gas)
        await getGas(sell, 'sell internal')
        
        await eventNames(purchase)
        await getEvents(purchase)
        await eventNames(sell2)
        await getEvents(sell2)
        await eventNames(sell4)
        await getEvents(sell4)
        await eventNames(sell3)
        await getEvents(sell3)
        await eventNames(purchase2)
        await getEvents(purchase2)
        await eventNames(purchase3)
        await getEvents(purchase3)
        await eventNames(sell)
        await getEvents(sell)
        await getBalances(STK, odex)
    });

    it('Continuous Exchange', async () => {
        console.log('\n')
        let STK = await Stk.deployed()
        let odex = await Odex.deployed()

        // Get list of users
        // List of buyers and list of sellers
        // Fund buyers and sellers
        // initiate transactions between them using random purchase amounts at random purchase prices
        var buyers = [
            ['1', accounts[1]],
            ['5', accounts[5]],
            ['6', accounts[6]],
            ['7', accounts[7]],
            ['8', accounts[8]]
        ]

        var sellers = [
            ['2', accounts[2]],
            ['3', accounts[3]],
            ['4', accounts[4]],
            ['9', accounts[9]],
        ]
        var fundEth = (10**19).toFixed()
        var fundToken = (10**19).toFixed()
        // fund with eth
        async function fund(list) {
            for(var i = 0; i < list.length; i++){
                // Deposit eth
                await odex.depositEth({from: list[i][1], value: fundEth})
                // transfer STK to other accounts
                await STK.transfer(list[i][1], fundToken, {from: purchaser})
                // approve token transfer
                await STK.approve(odex.address, fundToken, {from: list[i][1]})
                // deposit Tokens
                await odex.depositToken(token_symbol, fundToken, {from: list[i][1]})
            }
        }

        async function getListBalances(STK, odex, list)  {
            for(var i = 0; i < list.length; i++){
                console.log(' *** ACCOUNT *** ', list[i][0])
                
                let _eth = ((await web3.eth.getBalance(list[i][1]))/decimals).toFixed()
                console.log('Eth Balance: ', _eth)
                
                let _bal = ((await STK.balanceOf(list[i][1], {from: list[i][1]}))/decimals).toString()
                console.log('STK Balance: ', _bal)
                
                let _dex_bal = ((await odex.getTokenBalance(token_symbol, {from: list[i][1]}))/decimals).toString()
                console.log('DEX Token Balance: ', _dex_bal)
                
                let _eth_dex_bal = ((await odex.ethBalances(list[i][1]))/decimals).toString()
                console.log('DEX Eth Balance: ', _eth_dex_bal)
            }
        }

        async function randomSellOrder(sellerList){
            for(var i = 0; i < sellerList.length; i++){ // for each user make an order with a random price and amount
                var price = (Math.floor((Math.random() * 5) + 1)*10**18).toFixed()
                var amt = (Math.floor((Math.random() * 5) + 1)*10**18).toFixed()
                await odex.sellToken(token_symbol, price, amt, {from: sellerList[i][1]})
            }
        }
        async function randomBuyOrder(buyerList){
            for(var i = 0; i < buyerList.length; i++){ // for each user make an order with a random price and amount
                var price = (Math.floor((Math.random() * 5) + 1)*10**18).toFixed()
                var amt = (Math.floor((Math.random() * 5) + 1)*10**18).toFixed()
                await odex.buyToken(token_symbol, price, amt, {from: buyerList[i][1]})
            }
        }
        await fund(sellers)
        await fund(buyers)
        await randomSellOrder(sellers)
        await randomBuyOrder(buyers)
        await getListBalances(STK, odex, buyers)
        await getListBalances(STK, odex, sellers)
    });


})