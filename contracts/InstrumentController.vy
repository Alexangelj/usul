# @title Instrument Controller
# 
# @notice Controls specification, creation, and management of financial instruments and vehicles.
# 
# @author Alexander Angel
# 
# @dev System Controller is the management contract of this contract.
#
# @version 0.1.0b14
#
# @system Contract Hierarchy
#   Instrument Controller
#       Instrument Registry    
#           Asset Registry
#               Set Registry
#                   Parent Asset Factory
#                   Parent Set Factory
#                       Parent Token Factory
#                           Asset
#                               Set
#                                   Year
#                                       Month
#                                           Day
#   ========================================================
#                                               ERC-20 Token


struct Set:
    expiration: timestamp[4] # UNIX timestamp


struct Asset: # ERC-20 Token
    name: string[64]
    symbol: string[64]
    decimals: uint256
    assetAddress: address


struct Token: # Token representing an instrument has assets and conditions
    symbol: string[64]
    strike: Asset # ERC-20 Asset
    underlying: Asset # ERC-20 Asset
    expiration: timestamp # Condition of expiry
    taddress: address


struct AssetPair: # Entangles two Assets
    strike_asset: Asset
    underlying_asset: Asset
    ratio: uint256 # Amount of strike tokens per 1 underlying token


struct Instrument:
    symbol: string[64] # String to represent the instrument
    assets: AssetPair # Capital package of assets used by instrument
    set: Set # Set of expiration timestamps which are currently active
    iaddress: address


struct InstrumentRegistry:
    symbol: string[64] # String to represent types of instruments
    instruments: address[16]
    index: uint256 # Length of instruments array


struct FactoryRegistry: # Addresses of Factories being used
    symbol: string[64]
    asset: address
    set: address
    token: address
    instrument: address


struct Registry: # Links the Factories and Instruments together
    symbol: string[64]
    factories: FactoryRegistry
    instruments: InstrumentRegistry


contract AssetFactory():
    def name() -> string[64]:constant
    def createPair(_symbol: string[64], _strike: address, _underlying: address, _ratio: uint256) -> AssetPair:modifying
    def getStrikeAsset(_symbol: string[64]) -> (string[64], string[64], uint256, address):modifying
    def strikeAsset(_symbol: string[64]) -> Asset:modifying


contract SetFactory():
    def name() -> string[64]:constant
    def createSet(_symbol: string[64], _epoch: timestamp, _cycle: uint256) -> Set: modifying


contract TokenFactory():
    def name() -> string[64]:constant
    def createToken(
        _controller: address,
        _name: string[64],
        _symbol: string[64],
        _decimals: uint256,
        _supply: uint256,
        _template: address,
        _expiration: timestamp,
        _tokenId: bytes32,
    ) -> address:modifying


contract InstrumentFactory():
    def name() -> string[64]:constant
    def createInstrument(
        _controller: address,
        _name: string[64],
        _symbol: string[64],
        _ratio: uint256,
        _saddr: address,
        _uaddr: address,
        _set: timestamp[4],
        _tokens: address[4],
    ) -> address:modifying


contract Erc20():
    def name() -> string[64]:constant
    def symbol() -> string[64]:constant
    def decimals() -> uint256:constant
    def totalSupply() -> uint256:constant
    def balanceOf(_owner: address) -> uint256:constant
    def allowance(_owner: address, _spender: address) -> uint256:constant
    def transfer(_to: address, _value: uint256) -> bool:modifying
    def transferFrom(_from: address, _to: address, _value: uint256) -> bool:modifying
    def approve(_spender: address, _value: uint256) -> bool:modifying
    def mint(_to: address, _value: uint256):modifying
    def burnFrom(_to: address, _value: uint256):modifying


contract InstrumentContract():
    def activate() -> bool:modifying


# Interfaces





# Events


Payment: event({_from: indexed(address), _value: wei_value})


# CONSTANTS


MONTH_IN_SECONDS: constant(uint256) = 604800
EXPIRATION_STAMPS: constant(uint256) = 4



# State Variables


administrator: public(address)
depreciation: public(timestamp)


sets: public(map(string[64], Set))
assets: public(map(string[64], map(uint256, Asset))) # Maps a string to two assets: [0] = strike, [1] = underlying
tokens: public(map(string[64], map(timestamp, Token))) # Maps a string to a timestamp which is inherited by the Token
assetPair: public(map(string[64], AssetPair))
instruments: public(map(string[64], Instrument))
instrumentToken: public(map(string[64], map(address, Instrument))) # Maps symbol and token address to Instrument


instrumentFactory: InstrumentFactory
assetFactory: AssetFactory
setFactory: SetFactory
tokenFactory: TokenFactory
factoryRegistry: public(FactoryRegistry)
instrumentsRegistry: public(InstrumentRegistry)
registry: public(Registry)





# Fallback and Utility Functions


@public
@payable
def __default__():
    log.Payment(msg.sender, msg.value)


# Core Functions

# Create Instrument
#   Add to Instrument Registry
#       Instrument Factory
#           Assets
#               Sets
#                   Token Factory
#                       Tokens


@public
def __init__(   _instrumentFactory: address,
                _tokenFactory: address,
                _assetFactory: address,
                _setFactory: address,
                _depreciation: timestamp,
                _symbol: string[64],
            ):
    """
    @param __Factory Address of factory contract which generates components of instruments
    @param _depreciation Timestamp to signal depreciation of smart contract
    @param _symbol String to represent version of Instrument Controller code
    """
    # Administrative
    self.administrator = msg.sender
    self.depreciation = _depreciation


    # Factories
    self.instrumentFactory = InstrumentFactory(_instrumentFactory)
    self.assetFactory = AssetFactory(_assetFactory)
    self.setFactory = SetFactory(_setFactory)
    self.tokenFactory = TokenFactory(_tokenFactory)


    # Registries
    self.factoryRegistry = FactoryRegistry({
        symbol: _symbol, 
        asset: _assetFactory, 
        set: _setFactory, 
        token: _tokenFactory, 
        instrument: _instrumentFactory
        })
    self.registry = Registry({
        symbol: _symbol, 
        factories: self.factoryRegistry, 
        instruments: self.instrumentsRegistry
        })


@private
def createAssetPair(_symbol: string[64], _strike: address, _underlying: address, _ratio: uint256) -> bool:
    """
    @dev Creates a Capital Package of two assets and adds it to a struct
    @param _symbol String to represent the capital package
    @param _strike Address of the numerating asset
    @param _underlying Address of the denominating asset (Always 1)
    @param _ratio Exchange rate between numerating asset and denominating asset
    """
    # Adds the information of strike to the asset struct
    strikeName: string[64] = Erc20(_strike).name()
    strikeSymbol: string[64] = Erc20(_strike).symbol()
    strikeDecimals: uint256 = Erc20(_strike).decimals()
    self.assets[_symbol][0] = Asset({
        name: strikeName, 
        symbol: strikeSymbol, 
        decimals: strikeDecimals,
        assetAddress: _strike,
        })
    

    # Adds the information of underlying to the asset struct
    underlyingName: string[64] = Erc20(_underlying).name()
    underlyingSymbol: string[64] = Erc20(_underlying).symbol()
    underlyingDecimals: uint256 = Erc20(_underlying).decimals()
    self.assets[_symbol][1] = Asset({
        name: underlyingName, 
        symbol: underlyingSymbol, 
        decimals: underlyingDecimals,
        assetAddress: _underlying,
        })


    # Adds the information of the capital package to the asset pair struct
    self.assetPair[_symbol] = AssetPair({
        strike_asset: self.assets[_symbol][0],
        underlying_asset: self.assets[_symbol][1],
        ratio: _ratio
    })
    return True


@private
def createToken(_symbol: string[64], _tokenTemplate: address, _expiration: timestamp) -> address:
    """
    @dev Creates an ERC-20 token with an expiration timestamp
    @param _symbol String continuation of asset pair struct
    @param _tokenTemplate Address of the ERC-20 contract which acts as a template
    @param _expiration A timestamp to signal expiration of the token
    @return Address of the token created at the symbol and expiration timestamp
    """
    _saddr: Asset = self.assetPair[_symbol].strike_asset
    _uaddr: Asset = self.assetPair[_symbol].underlying_asset
    _tokenId: bytes32 = keccak256(
        concat(
            concat(
                keccak256(_symbol), convert(_expiration, bytes32)
                ),
            concat(
                keccak256(_saddr.symbol), keccak256(_uaddr.symbol)
                )
            )
        )
    self.tokens[_symbol][_expiration] = Token({
        symbol: _symbol,
        strike: _saddr,
        underlying: _uaddr,
        expiration: _expiration,
        taddress: self.tokenFactory.createToken(
                self,
                _symbol, # Name -> Symbol of instrument
                _symbol, # Symbol -> Represents 'Set' of expiration stamps this token is a part of
                convert(18, uint256), # Decimals
                convert(0, uint256), # Initial Amt
                _tokenTemplate, # Address of erc 20 token contract
                _expiration, #
                _tokenId,
            ),
    })
    return self.tokens[_symbol][_expiration].taddress


@private
def getTokens(_symbol: string[64]) -> address[4]:
    """
    @dev Gets token addresses entangled with instrument
    """
    address_list: address[4] = [ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS]
    instrument_set: Set = self.instruments[_symbol].set
    for i in range(EXPIRATION_STAMPS):
        address_list[i] = self.tokens[_symbol][instrument_set.expiration[i]].taddress
    
    return address_list


@public
def createInstrument(
        _symbol: string[64], 
        _strike: address,
        _underlying: address, 
        _ratio: uint256,
        _tokenTemplate: address
    ) -> address:
    """
    @dev Creates a new instrument with an asset pair, sets, and tokens
    @param _symbol String to represent the instrument and its components
    @param _strike Address of the strike asset
    @param _underlying Address of the underlying asset
    @param _ratio Strike : Underlying ratio -> Ratio : 1
    @param _tokenTemplate Address of the ERC-20 token to copy
    @retrurn Address of created Instrument
    """
    # Generate a set with symbol
    self.sets[_symbol] = self.setFactory.createSet(_symbol, self.depreciation, MONTH_IN_SECONDS)
    _set: Set = self.sets[_symbol]

    # Generate an asset pair with symbol
    self.createAssetPair(_symbol, _strike, _underlying, _ratio)
    _assets: AssetPair = self.assetPair[_symbol]
    _saddr: Asset = _assets.strike_asset
    _uaddr: Asset = _assets.underlying_asset
    
    # Creates a list of token addresses which are linked to the set and asset pair
    token_list: address[4] = [ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS]
    for i in range(EXPIRATION_STAMPS):
        token_list[i] = self.createToken(_symbol, _tokenTemplate, _set.expiration[i])

    # Creates the Instrument using the tokens, asset pair, and set
    self.instruments[_symbol] = Instrument({
        symbol: _symbol,
        assets: _assets, # Asset Pair
        set: _set, # Array of expiration timestamps
        iaddress: self.instrumentFactory.createInstrument(
                self,
                _symbol,
                _symbol,
                _ratio,
                _saddr.assetAddress,
                _uaddr.assetAddress,
                _set.expiration,
                token_list,
            )
        })
    iaddress: address = self.instruments[_symbol].iaddress
    self.instrumentsRegistry.index += 1
    index: uint256 = self.instrumentsRegistry.index
    self.instrumentsRegistry.instruments[index] = iaddress
    return iaddress


@public
def activateInstrument(_symbol: string[64]) -> bool:
    """
    @dev An initialized Instrument needs to be activate its entangled tokens
    """
    iaddress: address = self.instruments[_symbol].iaddress
    return InstrumentContract(iaddress).activate()


@public
def mint(_instrumentSymbol: string[64], _user: address, _amount: uint256, _tokenId: address):
    assert self.instruments[_instrumentSymbol].iaddress == msg.sender
    Erc20(_tokenId).mint(_user, _amount)


@public
def burn(_instrumentSymbol: string[64], _user: address, _amount: uint256, _tokenId: address):
    assert self.instruments[_instrumentSymbol].iaddress == msg.sender
    Erc20(_tokenId).burnFrom(_user, _amount)


@public
def createAssetPairTest(_symbol: string[64], _strike: address, _underlying: address, _ratio: uint256) -> bool:
    """
    @dev Creates a Capital Package of two assets and adds it to a struct
    @param _symbol String to represent the capital package
    @param _strike Address of the numerating asset
    @param _underlying Address of the denominating asset (Always 1)
    @param _ratio Exchange rate between numerating asset and denominating asset
    """
    # Adds the information of strike to the asset struct
    strikeName: string[64] = Erc20(_strike).name()
    strikeSymbol: string[64] = Erc20(_strike).symbol()
    strikeDecimals: uint256 = Erc20(_strike).decimals()
    self.assets[_symbol][0] = Asset({
        name: strikeName, 
        symbol: strikeSymbol, 
        decimals: strikeDecimals,
        assetAddress: _strike,
        })
    

    # Adds the information of underlying to the asset struct
    underlyingName: string[64] = Erc20(_underlying).name()
    underlyingSymbol: string[64] = Erc20(_underlying).symbol()
    underlyingDecimals: uint256 = Erc20(_underlying).decimals()
    self.assets[_symbol][1] = Asset({
        name: underlyingName, 
        symbol: underlyingSymbol, 
        decimals: underlyingDecimals,
        assetAddress: _underlying,
        })


    # Adds the information of the capital package to the asset pair struct
    self.assetPair[_symbol] = AssetPair({
        strike_asset: self.assets[_symbol][0],
        underlying_asset: self.assets[_symbol][1],
        ratio: _ratio
    })
    return True


@public
def createTokenTest(_symbol: string[64], _tokenTemplate: address, _expiration: timestamp) -> address:
    _saddr: Asset = self.assetPair[_symbol].strike_asset
    _uaddr: Asset = self.assetPair[_symbol].underlying_asset
    _tokenId: bytes32 = keccak256(
        concat(
            concat(
                keccak256(_symbol), convert(_expiration, bytes32)
                ),
            concat(
                keccak256(_saddr.symbol), keccak256(_uaddr.symbol)
                )
            )
        )
    self.tokens[_symbol][_expiration] = Token({
        symbol: _symbol,
        strike: _saddr,
        underlying: _uaddr,
        expiration: _expiration,
        taddress: self.tokenFactory.createToken(
                self,
                _symbol, # Name -> Symbol of instrument
                _symbol, # Symbol -> Represents 'Set' of token
                convert(18, uint256), # Decimals
                convert(0, uint256), # Initial Amt
                _tokenTemplate, # Address of erc 20 token contract
                _expiration,
                _tokenId,
            ),
    })
    return self.tokens[_symbol][_expiration].taddress
