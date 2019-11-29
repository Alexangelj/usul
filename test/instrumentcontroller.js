/*
@title A full test which implements multiple parts, UDR, STK, cMoat, and pMoat for the rinkeby testnet

@notice Users can buy, write, trade, exercise, and close the MOATs

@author Alexander Angel

@dev First tests just check initalization, then we test user's interaction with the dex
     then we process transactions through the MUDR, and finally we settle on the dex.
*/

const assert = require('assert').strict;
const Factory = artifacts.require('Factory')
const Wax = artifacts.require('Wax')
const Stk = artifacts.require('STK') // Strike Asset
const Udr = artifacts.require('UDR') // Underlying Asset
const cMoat = artifacts.require('cMoat') // Optionality Purchase Transfer Right -> Purchaser underlying for strike
const pMoat = artifacts.require('pMoat') // Optionality Sale Transfer Right -> Sell underlying for strike
const InstrumentController = artifacts.require('InstrumentController')
const AssetFactory = artifacts.require('AssetFactory')
const SetFactory = artifacts.require('SetFactory')
const TokenFactory = artifacts.require('TokenFactory')
const InstrumentFactory = artifacts.require('InstrumentFactory')
const Genesis = artifacts.require('Genesis')
const GenesisToken = artifacts.require('GenesisToken')


contract('Controller', accounts => {


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

    async function getGas(func, name) {
        /*
        @param func function to get gas from
        @param name string of function name
        */
        let spent = await func.receipt.gasUsed
        gas.push([name + ' gas: ', spent])
    }

    it('Creates Instrument Controller', async () => {
        let _ic = await InstrumentController.deployed()
        let _udr = await Udr.deployed()
        let _stk = await Stk.deployed()
        let _gt = await GenesisToken.deployed()


        // Administrative
        assert.strictEqual(await _ic.administrator(), Alice, 'Account[0] not admin')


        // Factory Registry
        let assetFactory = await AssetFactory.deployed()
        let setFactory = await SetFactory.deployed()
        let tokenFactory = await TokenFactory.deployed()
        let instrumentFactory = await InstrumentFactory.deployed()

        async function facReg(){
            let symbol = await _ic.factoryRegistry__symbol()
            let asset = await _ic.factoryRegistry__asset()
            let set = await _ic.factoryRegistry__set()
            let token = await _ic.factoryRegistry__token()
            let instrument = await _ic.factoryRegistry__instrument()


            assert.strictEqual(symbol, symbol, 'Symbol not equal')
            assert.strictEqual(asset, assetFactory.address, 'asset not equal')
            assert.strictEqual(set, setFactory.address, 'set not equal')
            assert.strictEqual(token, tokenFactory.address, 'token not equal')
            assert.strictEqual(instrument, instrumentFactory.address, 'instrument not equal')
        }
        await facReg()        


        // Registry
        assert.strictEqual(
            await _ic.registry__symbol(),
            await _ic.registry__factories__symbol(),
            'Registry and Factory Registry symbol not equal'
        )
    });


    it('Creates Asset Pair', async () => {
        let _ic = await InstrumentController.deployed()
        let _udr = await Udr.deployed()
        let _stk = await Stk.deployed()
        let _gt = await GenesisToken.deployed()


        // Generate Tokens
        let capt = await _ic.createAssetPairTest(symbol, _stk.address, _udr.address, ratio)
        await getGas(capt, 'Create Token')

        
        // Test asset struct
        async function getAsset(asset, index) {
            let assetname = await asset.name()
            let assetsymbol = await asset.symbol()
            let assetdecimals = (await asset.decimals()).toString()
            let assetaddress = await asset.address

            let sname = await _ic.assets__name(symbol, index)
            let ssymbol = await _ic.assets__symbol(symbol, index)
            let sdecimals = (await _ic.assets__decimals(symbol, index)).toString()
            let saddress = await _ic.assets__assetAddress(symbol, index)

            assert.strictEqual(
                assetname,
                sname,
                'Name not equal'
            )
            assert.strictEqual(
                assetsymbol,
                ssymbol,
                'symbol not equal'
            )
            assert.strictEqual(
                assetdecimals,
                sdecimals,
                'decimals not equal'
            )
            assert.strictEqual(
                assetaddress,
                saddress,
                'address not equal'
            )
        }
        await getAsset(_stk, 0)
        await getAsset(_udr, 1)
        

        // Test asset pair struct
        async function getAssetPair() {
            let stkname = await _stk.name()
            let udrname = await _udr.name()

            let sname = await _ic.assetPair__strike_asset__name(symbol)
            let uname = await _ic.assetPair__underlying_asset__name(symbol)
            let _ratio = (await _ic.assetPair__ratio(symbol)).toString()

            assert.strictEqual(
                stkname,
                sname,
                'strike name not equal'
            )
            assert.strictEqual(
                udrname,
                uname,
                'underlying name not equal'
            )
            assert.strictEqual(
                (ratio).toString(),
                (_ratio).toString(),
                'ratio not equal'
            )
        }
        await getAssetPair()
        

    });


    it('Creates Tokens', async () => {
        let _ic = await InstrumentController.deployed()
        let _udr = await Udr.deployed()
        let _stk = await Stk.deployed()
        let _gt = await GenesisToken.deployed()


        // Generate structs
        let ctt = await _ic.createTokenTest(symbol, _gt.address, expiration)
        await getGas(ctt, 'Create Asset Pair')

        
        // Test token struct
        async function getToken() {
            let stkaddress = await _stk.address
            let udraddress = await _udr.address

            let _symbol = await _ic.tokens__symbol(symbol, expiration)
            let _stkaddress = await _ic.tokens__strike__assetAddress(symbol, expiration)
            let _udraddress = await _ic.tokens__underlying__assetAddress(symbol, expiration)
            let _expiration = await _ic.tokens__expiration(symbol, expiration)

            assert.strictEqual(symbol, _symbol, 'symbol not equal')
            assert.strictEqual(stkaddress, _stkaddress, 'stkaddress not equal')
            assert.strictEqual(udraddress, _udraddress, 'udraddress not equal')
            assert.strictEqual((expiration).toString(), (_expiration).toString(), 'expiration not equal')

            let totalSupply = 0
            let tokenAddress = await _ic.tokens__taddress(symbol, expiration)
            let token = await GenesisToken.at(tokenAddress)
            let _name = await token.name()
            let __symbol = await token.symbol()
            let _decimals = await token.decimals()
            let _totalSupply = await token.totalSupply()
            let __expiration = await token.expiration()
            let _tokenId = await token.tokenId()


            assert.strictEqual(_name, symbol, 'Name not equal')
            assert.strictEqual(__symbol, symbol, 'symbol not equal')
            assert.strictEqual((_decimals).toString(), (18).toString(), 'decimals not equal')
            assert.strictEqual((_totalSupply).toString(), (totalSupply).toString(), 'totalSupply not equal')
            assert.strictEqual((__expiration).toString(), (expiration).toString(), 'expiration not equal')
            

        }
        await getToken()
    });


    it('Creates Instrument', async () => {
        let _ic = await InstrumentController.deployed()
        let _udr = await Udr.deployed()
        let _stk = await Stk.deployed()
        let _gt = await GenesisToken.deployed()
        let _g = await Genesis.deployed()


        // Generate structs
        let ci = await _ic.createInstrument(symbol, _stk.address, _udr.address, ratio, _gt.address)
        await getGas(ci, 'Creates an Instrument')


        // Test Set
        async function getSet() {
            let stkaddress = await _stk.address
            let udraddress = await _udr.address

            var MONTHS_IN_SECONDS = 604800
            var STAMPS = 4

            let set0 = await _ic.sets__expiration(symbol, 0)
            
            for(var i = 0; i < STAMPS; i++){
                let set = await _ic.sets__expiration(symbol, i)
                assert.strictEqual((set).toString(), (expiration + MONTHS_IN_SECONDS * i).toString(), 'Set not equal')
            }
        }
        await getSet()

        
        // Test token struct
        async function getInstrument() {
            let stkaddress = await _stk.address
            let udraddress = await _udr.address

            let _symbol = await _ic.instruments__symbol(symbol)
            let _stkaddress = await _ic.instruments__assets__strike_asset__assetAddress(symbol)
            let _udraddress = await _ic.instruments__assets__underlying_asset__assetAddress(symbol)
            let iaddress = await _ic.instruments__iaddress(symbol)
            let instrument = await Genesis.at(iaddress)


            var STAMPS = 4
            for(var i = 0; i < STAMPS; i++){
                let set = await _ic.sets__expiration(symbol, i)
                assert.strictEqual((set).toString(), (await _ic.instruments__set__expiration(symbol, i)).toString(), 'Set not equal')
                assert.strictEqual((set).toString(), (await instrument.set(i)).toString(), 'Set not equal')
                
                let token = await _ic.tokens__taddress(symbol, set)
                assert.strictEqual(token, (await instrument.tokens(i)), 'Token addresses not equal')
            
            }


            let _name = await instrument.name()
            let __symbol = await instrument.symbol()
            let _ratio = await instrument.ratio()

            assert.strictEqual(_name, symbol, 'Name not equal')
            assert.strictEqual(__symbol, _symbol, 'Symbol not equal')
            assert.strictEqual((_ratio).toString(), (ratio).toString(), 'ratio not equal')

        }
        await getInstrument()

        let activate = await _ic.activateInstrument(symbol)
        await getGas(activate, 'Activate Instrument')
    });


    it('Tests Created Instrument', async () => {
        let _ic = await InstrumentController.deployed()
        let _udr = await Udr.deployed()
        let _stk = await Stk.deployed()
        let _gt = await GenesisToken.deployed()
        let _g = await Genesis.deployed()
        let iaddress = await _ic.instruments__iaddress(symbol)
        

        // Get Instrument instance
        let instrument = await Genesis.at(iaddress)


        // Test Write
        async function write() {
            let deposit = (10**20).toFixed()
            let taddress = await instrument.timestamps(expiration)
            let token = await GenesisToken.at(taddress)

            let approve = await _udr.approve(iaddress, deposit)
            let write = await instrument.write(deposit, taddress)
            await getGas(write, 'Write Test Instrument')

            assert.strictEqual(
                 (await instrument.lockBook__locks__underlying_amount(
                     await instrument.user_to_key(Alice)
                     )).toString(),
                     deposit,
                     'Deposits not equal'
                )
            assert.strictEqual((await token.balanceOf(Alice)).toString(), deposit, 'Minted tokens not equal')
        }
        await write()

        // Test Write
        async function close() {
            let deposit = (10**20).toFixed()
            let closeAmount = (10**19).toFixed()
            let taddress = await instrument.timestamps(expiration)
            let token = await GenesisToken.at(taddress)

            let approve = await _udr.approve(iaddress, closeAmount)
            let burnApprove = await token.approve(_ic.address, closeAmount) // MUST Approve the instrument controller to burn tokens
            let close = await instrument.close(closeAmount, taddress)
            await getGas(close, 'close Test Instrument')

            assert.strictEqual(
                 (await instrument.lockBook__locks__underlying_amount(
                     await instrument.user_to_key(Alice)
                     )).toString(),
                     (deposit * 1 - closeAmount * 1).toString(),
                     'closes not equal'
                )
            assert.strictEqual((await token.balanceOf(Alice)).toString(), (deposit * 1 - closeAmount * 1).toString(), 'Burned tokens not equal')
        }
        await close()

    });

})