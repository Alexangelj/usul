/*
@title A full test which implements multiple parts, UDR, STK, cMoat, and pMoat for the rinkeby testnet

@notice Users can buy, write, trade, exercise, and close the MOATs

@author Alexander Angel

@dev First tests just check initalization, then we test user's interaction with the dex
     then we process transactions through the MUDR, and finally we settle on the dex.
*/

const assert = require('assert').strict;
const Stk = artifacts.require('STK') // Strike Asset
const Udr = artifacts.require('UDR') // Underlying Asset
const Solo = artifacts.require('Solo')


contract('Solo Test', accounts => {


    // Starting users to use in test
    var users_test = 2


    // User Accounts
    var Alice = accounts[0]
    var Bob = accounts[1]
    var Mary = accounts[2]
    var Kiln = accounts[3]
    var Don = accounts[4]
    var Penny = accounts[5]
    var Cat = accounts[6]
    var Bjork = accounts[7]
    var Olga = accounts[8]
    var Treasury = accounts[9]
    var typeC = 'C'
    var typeP = 'P'


    // Accounts Array
    var acc_ray = [
        ['Alice', Alice],
        ['Bob', Bob],
        ['Mary', Mary],
        ['Kiln', Kiln],
        ['Don', Don],
        ['Penny', Penny],
        ['Cat', Cat],
        ['Bjork', Bjork],
        ['Olga', Olga],
        ['Treasury', Treasury]
    ]

    // Contract Parameters
    var strike = (12*10**18).toFixed() // Strike is 12 STK
    var underlying = (1*10**18).toFixed() // Underlying is 4 UDR
    var expiration = 1640836800 // dec 30 2021
    var decimals = (10**18)
    var gas = []
    var symbol = 'v0.0.1'
    var ratio = 5
    var hundred = (10**20).toFixed()
    var deposit = (10**19).toFixed()
    var close = (5*10**18).toFixed()
    var exercise = (5*10**18).toFixed()

    async function getGas(func, name) {
        /*
        @param func function to get gas from
        @param name string of function name
        */
        let spent = await func.receipt.gasUsed
        gas.push([name + ' gas: ', spent])
    }

    it('Creates Instrument and Tests functionality', async () => {
        let _solo = await Solo.deployed()
        let stk = await Stk.deployed()
        let udr = await Udr.deployed()
        console.log(((await udr.balanceOf(Alice))/decimals).toString())
        console.log(await _solo.udr_address())
        await stk.approve(_solo.address, hundred)
        await udr.approve(_solo.address, hundred)

        let withdrawStk = await stk.withdraw((deposit * ratio).toString())
        let withdrawUdr = await udr.withdraw(deposit)
        let withdrawUdr2 = await udr.withdraw(deposit)

        let _write = await _solo.write(deposit, {from: Alice})
        let _close = await _solo.close(close)
        let _exercise = await _solo.exercise(exercise)
        await getGas(_write, 'write')
        await getGas(_close, 'close')
        await getGas(_exercise, 'exercise')
        
        let _write2 = await _solo.write(deposit, {from: Alice})
        let _tx = await _solo.transfer(_solo.address, deposit, {from: Alice})
        let ethPrice = await _solo.ethPrice()
        let ether = ethPrice * deposit / decimals
        let cost = (ether).toFixed()
        console.log((await _solo.lockBook__locks__underlying_amount(0)).toString())
        console.log('before: ', (await _solo.balanceOf(Alice)).toString())
        let _buy = await _solo.purchaseSolo(deposit, {value: ether})
        console.log('after: ', (await _solo.balanceOf(Alice)).toString())
        assert.strictEqual((await _solo.balanceOf(Alice)).toString(), deposit, 'deposit and buy are not equal')
        await getGas(_tx, 'tx')
        await getGas(_buy, 'buy')
        
        console.log('before eth ', (await web3.eth.getBalance(Alice)).toString())
        let soloEth = await web3.eth.getBalance(_solo.address)
        let withdrawEth = await _solo.withdrawEth(soloEth)
        console.log('after eth ', (await web3.eth.getBalance(Alice)).toString())

        //let expire = await _solo.expire()
        //console.log('supply ', web3.utils.fromWei(await _solo.totalSupply()))

        console.log(gas)
    });

})