const assert = require('assert').strict;
const Account = artifacts.require("Account");
const AccountFactory = artifacts.require('AccountFactory')
const ECO = artifacts.require("ECO");
const ECOFactory = artifacts.require('ECOFactory')
const ECOPriceOracle = artifacts.require('ECOPriceOracle')
const Slate20 = artifacts.require('Slate20')
const Stash20 = artifacts.require('Stash20')
const Wax = artifacts.require('Wax')
const Dai = artifacts.require('Dai')
const ARC = artifacts.require('Arc')

contract('Arc', accounts => {

    // Lets make a CALL 2 ETH Strike for DAI underlying asset, with a notional of 2
    // Exercise price will be 5 ETH
    // Writer Puts Tokens underwriting contract, DAI * notional = 2 DAI
    // Purchaser buys option for 1 ETH
    // Writer Recieves 1 ETH
    // Purchaser receives 2 DAI for 4 ETH, notional * strike
    // Writer Recieves 4 ETH

    // Purchaser Paid 5 ETH for 2 Dai, this is profitable if Dai > 2.5 ETH,
    // Since the exercise price was 5 ETH for 1 Dai, that means it cost 10 ETH for 2 Dai,
    // which is a ratio of 5 ETH per Dai. Purchaser nets 2.5 ETH
    // Writer Recieved 5 ETH for 2 Dai
    // If writer did not do option, they would have recieved 10 ETH for the 2 Dai.

    // All units need to have 18 decimal places, passed in as strings.

    // Test Case Parameters
    // CALL 2 ETH Strike Price for 1 DAI token, with a 10 notional
    // premium = 1
    // Strike = 2
    // Margin = 1 DAI * 10 notional = 10 DAI
    // Underlying Value will go to 5, but that doesnt matter,
    // it's exercisable so 10 tokens will be delivered for the 2 ETH
    // Buyer needs to pay for the deposited tokens at the strike price

    var writer = accounts[0]
    var purchaser = accounts[1]
    var wei = 10**18
    var gas = []
    var strike_prc = 2
    var strike = (strike_prc*wei).toFixed()
    var notional = 10
    var strike_val_num = (strike_prc*notional*wei)
    var strike_val = (strike_val_num).toFixed()
    var margin = (10*wei).toFixed()
    var underlying = 5
    var premium = (1*wei).toFixed()
    var maturity = 10

    // Old
    //var underlying = 2
    //var premium = 1
    //var margin = premium * 3
    //var strk = 1 // in uint256
    //var notional = 2 // uint256 this is amount the contract handles
    //var maturity = 10 // time in seconds?
    //var margin_multiplier = 3 // 300% margin for a 150% covered call option writer
    //var margin_deposit = strk * notional * margin_multiplier // uint256 required margin from writer
    //var underlying_value = underlying * notional
    //var premium_multipler = 1
    //var premium = strk * premium_multipler
    //var strike_value = strk * notional
    //var strike = 1
    
    // New 
    //var maturity = 10
    //var strike = 2*10**18 // In ETH
    //var underlying = 5*10**18 // In Eth Price
    //var margin = 2*10**18 // DAI Token * notional
    //var notional = 2

    // Strings
    //var maturity = 10
    //var strike = (2*10**18).toString() // In ETH
    //var underlying = (5*10**18).toString() // In Eth Price
    //var margin = (2*10**18).toString() // DAI Token * notional
    //var notional = 2

    // Full Strings
    //var maturity = 10
    //var strike = 2 // In ETH
    //var underlying = 5 // In Eth Price
    //var margin = 2 // DAI Token * notional
    //var notional = 2

    console.log(strike, underlying, margin)

    async function getGas(func, name) {
        let spent = await func.receipt.gasUsed
        gas.push([name + ' gas: ', spent])
    }

    async function checkBalances(arc_address, slate20_addr, stash20_addr, dai){
        var bal_before = [
            'purchaser: ',
            'writer: ',
            'ARC: ',
            'Slate20 ETH: ',
            'Stash20 ETH: ',
        ]
        var acc_list = [
            purchaser,
            writer,
            arc_address,
            slate20_addr,
            stash20_addr,
        ]
        for(var i = 0; i < acc_list.length; i++) {
            console.log(bal_before[i], await web3.eth.getBalance(acc_list[i])/10**18)
        }
        console.log('Stash20 DAI: ', dai)
    }


    it('Creates Stash20 Contract', async () => {
        console.log('\n')
        let stash20 = await Stash20.deployed()
        console.log('Stash20: ', stash20.address)
    });

    it('Creates Slate20 Contract', async () => {
        console.log('\n')
        let slate20 = await Slate20.deployed()
        console.log('Slate20: ', slate20.address)
    });

    it('Creates arc Contract', async () => {
        console.log('\n')
        let arc_fac = await ECOFactory.deployed()
        console.log(
            purchaser,
            writer,  
            strike, 
            notional, 
            maturity,
            margin,
            true
        )
        let arc = await arc_fac.createEco(  purchaser,
                                            writer,  
                                            strike, 
                                            notional, 
                                            maturity,
                                            margin,
                                            true
                                            )
                                            // Get gas usage
        let arc_gas = await arc.receipt.gasUsed
        console.log('arc Gas Internal: ', arc_gas)
        await getGas(arc, 'arc internal')

        // New with struct
        //let arc_address = await arc_fac.getEco(purchaser)
        //let _arc = await ARC.at(arc_address)
        //let struct_strike = await _arc.terms__strike()
        //console.log('struct strike: ', struct_strike.toString())
        let dai = await Dai.deployed()
        let arc_address = await arc_fac.getEco(purchaser)
        let _arc = await ARC.at(arc_address)
        let arc_dai = (await dai.balanceOf(arc_address)).toString()
        let writer_dai = (await dai.balanceOf(writer)).toString()
        let purchaser_dai = (await dai.balanceOf(purchaser)).toString()
        console.log('Arc Dai: ', arc_dai)
        console.log('Writer Dai: ', writer_dai)
        console.log('Purchaser Dai: ', purchaser_dai)
        console.log(' *** End ARC Create *** ')
    });

    it('Write Function Test', async () => {
        console.log(' *** Writes ***')
        // Get instantes
        let dai = await Dai.deployed()
        let arc_fac = await ECOFactory.deployed()
        let arc_address = await arc_fac.getEco(purchaser)
        let _arc = await ARC.at(arc_address)
        let slate20 = await Slate20.deployed()
        let stash20 = await Stash20.deployed()
        
        // Get DAI Balance of Stash20
        let dai_arc = await dai.transfer(arc_address, '100000000000000000000')
        let sbal1 = (await dai.balanceOf(stash20.address)).toString()
        console.log('Stash20: ', sbal1/wei)

        // Get margin from margin defined in the contract
        
        // New with Struct
        //let marg = await _arc.terms__margin()
        //console.log('Margin Deposited: ', marg.toString())
        //let write = await _arc.write(arc_address, premium, marg, {from: writer})

        // Old with inline
        console.log('Margin Deposited: ', margin)
        let approve = await dai.approve(arc_address, margin)
        let write = await _arc.write(premium, margin, {from: writer})
        
        // Old
        // let write = await _arc.write(arc_address, premium, '3000000000000000000', {from: writer})
        
        // Get Stash20 DAI Balance -> Should be equal to margin
        let sbal2 = (await dai.balanceOf(stash20.address)).toString()
        console.log('Stash20 ', sbal2/wei)
        
        // Get gas usage
        let write_gas = await write.receipt.gasUsed
        console.log('write Gas Internal: ', write_gas)
        await getGas(write, 'write internal')

        // Confirm writer is writer of contract
        let wrote = await slate20.wrote(arc_address)
        console.log('Wrote: ', wrote)
        assert.equal(wrote, writer, 'Should be writer writing')

        // Confirm funds deposited, can be removed because this is for cash settled
        let fund = await stash20.fund(writer)
        console.log('Fund: ', (fund).toString())
        assert.strictEqual((fund).toString(), margin.toString(), 'Writer should have funded Stash20')

        // Dai balances of users
        let arc_dai = (await dai.balanceOf(arc_address)).toString()
        let writer_dai = (await dai.balanceOf(writer)).toString()
        let purchaser_dai = (await dai.balanceOf(purchaser)).toString()
        console.log('Arc Dai: ', arc_dai)
        console.log('Writer Dai: ', writer_dai)
        console.log('Purchaser Dai: ', purchaser_dai)

        // Get Balances of Accts
        console.log('Should have transferred margin: ' + margin.toString() + ' to Stash20')
        await checkBalances(arc_address, slate20.address, stash20.address, sbal2)
    });

    it('Purchase Function Test', async () => {
        console.log(' *** Purchases ***')
        // Get instances
        let dai = await Dai.deployed()
        let arc_fac = await ECOFactory.deployed()
        let arc_address = await arc_fac.getEco(purchaser)
        let _arc = await ARC.at(arc_address)
        let slate20 = await Slate20.deployed()
        let stash20 = await Stash20.deployed()
        
        // Purchase function, should pay premium
        let purchase = await _arc.purchase(premium, {from: purchaser, value: premium })
        
        // Get gas usage
        let purchase_gas = await purchase.receipt.gasUsed
        console.log('purchase Gas Internal: ', purchase_gas)
        await getGas(purchase, 'purchase internal')

        // Confirms purchase
        let bought = await slate20.bought(arc_address)
        console.log('Bought: ', bought)
        assert.equal(bought, purchaser, 'Should be purchaser purchasing')

        // Confirms premium was paid
        let prm = await slate20.premium(purchaser)
        console.log('Premium: ', prm.toString())
        assert.strictEqual(prm.toString(), premium, 'purchaser should have paid premium')
        
        // Dai balances of users
        let arc_dai = (await dai.balanceOf(arc_address)).toString()
        let writer_dai = (await dai.balanceOf(writer)).toString()
        let purchaser_dai = (await dai.balanceOf(purchaser)).toString()
        console.log('Arc Dai: ', arc_dai)
        console.log('Writer Dai: ', writer_dai)
        console.log('Purchaser Dai: ', purchaser_dai)

        // Checks balances
        console.log('Should have transferred premium: ' + premium.toString() + ' to Slate20')
        let dai_bal = (await dai.balanceOf(stash20.address)).toString()
        await checkBalances(arc_address, slate20.address, stash20.address, dai_bal)
    });

    it('arc Validation', async () => {
        console.log(' *** Validates ***')
        let dai = await Dai.deployed()
        let arc_fac = await ECOFactory.deployed()
        let arc_address = await arc_fac.getEco(purchaser)
        let _arc = await ARC.at(arc_address)
        let slate20 = await Slate20.deployed()
        let stash20 = await Stash20.deployed()
        let fund = await stash20.fund(writer)
        let bought = await slate20.bought(arc_address)
        let prmium = await slate20.premium(purchaser)
        
        let sbal1 = (await dai.balanceOf(stash20.address)).toString()
        
        assert.strictEqual(bought, purchaser, 'Option address should match buyer')
        assert.strictEqual(prmium.toString(), premium.toString(), 'Should have paid premium')
        assert.strictEqual((fund/wei).toString(), (sbal1/wei).toString(), 'Stash20 balance should equal writer margin')
        //console.log(fund.toString())
        //console.log(await _arc.margin())
        let validation = await _arc.validate()
        let validation_gas = await validation.receipt.gasUsed
        console.log('validation Gas Internal: ', validation_gas)
        await getGas(validation, 'validation')

        //let log = await validation.receipt.logs[0].args
        //console.log(log)
        
        // Dai balances of users
        let arc_dai = (await dai.balanceOf(arc_address)).toString()
        let writer_dai = (await dai.balanceOf(writer)).toString()
        let purchaser_dai = (await dai.balanceOf(purchaser)).toString()
        console.log('Arc Dai: ', arc_dai)
        console.log('Writer Dai: ', writer_dai)
        console.log('Purchaser Dai: ', purchaser_dai)

        let dai_bal = (await dai.balanceOf(stash20.address)).toString()
        await checkBalances(arc_address, slate20.address, stash20.address, dai_bal)
    });

    it('arc Maturity', async () => {
        console.log('\n')
        let dai = await Dai.deployed()
        let arc_fac = await ECOFactory.deployed()
        let arc_address = await arc_fac.getEco(purchaser)
        let _arc = await ARC.at(arc_address)
        let slate20 = await Slate20.deployed()
        let stash20 = await Stash20.deployed()
        let wax = await Wax.deployed()
        
        let mature = await _arc.isMature()
        let mature_gas = await mature.receipt.gasUsed
        console.log('mature Gas Internal: ', mature_gas)
        await getGas(mature, 'mature')

        let timestamp = await wax.expiration(arc_address)
        console.log('Expiration timestamp: ', timestamp.toNumber())

        // Dai balances of users
        let arc_dai = (await dai.balanceOf(arc_address)).toString()
        let writer_dai = (await dai.balanceOf(writer)).toString()
        let purchaser_dai = (await dai.balanceOf(purchaser)).toString()
        console.log('Arc Dai: ', arc_dai)
        console.log('Writer Dai: ', writer_dai)
        console.log('Purchaser Dai: ', purchaser_dai)

        let dai_bal = (await dai.balanceOf(stash20.address)).toString()
        await checkBalances(arc_address, slate20.address, stash20.address, dai_bal)
    });

    // Need to build DEX before I allow this
    //it('arc Purchase/Sell to Close', async () => {
    //    console.log('\n')
    //    let dai = await Dai.deployed()
    //    let arc_fac = await ECOFactory.deployed()
    //    let arc_address = await arc_fac.getEco(purchaser)
    //    let _arc = await ARC.at(arc_address)
    //    let slate20 = await Slate20.deployed()
    //    let stash20 = await Stash20.deployed()
    //    
    //    // Must be from original writer for a premium amt parameter
    //    let purchaseClose = await _arc.purchaseClose(premium, {from: writer, value: premium})
    //    
    //    let purchaseClose_gas = await purchaseClose.receipt.gasUsed
    //    console.log('purchaseClose Gas Internal: ', purchaseClose_gas)
    //    await getGas(purchaseClose, 'purchaseClose')
//
    //    // Must be from a buyer who owns the option
    //    let sellClose = await _arc.sellClose({from: purchaser})
    //    
    //    let sellClose_gas = await sellClose.receipt.gasUsed
    //    console.log('sellClose Gas Internal: ', sellClose_gas)
    //    await getGas(sellClose, 'sellClose')
//
//
    //    // Dai balances of users
    //    let arc_dai = (await dai.balanceOf(arc_address)).toString()
    //    let writer_dai = (await dai.balanceOf(writer)).toString()
    //    let purchaser_dai = (await dai.balanceOf(purchaser)).toString()
    //    console.log('Arc Dai: ', arc_dai)
    //    console.log('Writer Dai: ', writer_dai)
    //    console.log('Purchaser Dai: ', purchaser_dai)
//
    //    let dai_bal = (await dai.balanceOf(stash20.address)).toString()
    //    await checkBalances(arc_address, slate20.address, stash20.address, dai_bal)
    //});

    it('arc Exercise', async () => {
        // Get contract instances
        console.log('\n')
        let dai = await Dai.deployed()
        let arc_fac = await ECOFactory.deployed()
        let arc_address = await arc_fac.getEco(purchaser)
        let _arc = await ARC.at(arc_address)
        let slate20 = await Slate20.deployed()
        let stash20 = await Stash20.deployed()

        // Exercise comes from buyer, where they pay for the underlying at the strike price (in wei)
        let exercise = await _arc.exercise({from: purchaser, value: strike_val})
        
        // Get gas usage
        let exercise_gas = await exercise.receipt.gasUsed
        console.log('exercise Gas Internal: ', exercise_gas)
        await getGas(exercise, 'exercise')

        // Get dai balance of stash
        let dai_bal = (await dai.balanceOf(stash20.address)).toString()
        await checkBalances(arc_address, slate20.address, stash20.address, dai_bal)
        
        // Get Dai balances of users
        let arc_dai = (await dai.balanceOf(arc_address)).toString()
        let writer_dai = (await dai.balanceOf(writer)).toString()
        let purchaser_dai = (await dai.balanceOf(purchaser)).toString()
        console.log('Arc Dai: ', arc_dai)
        console.log('Writer Dai: ', writer_dai)
        console.log('Purchaser Dai: ', purchaser_dai)
        console.log(gas)
    });


})