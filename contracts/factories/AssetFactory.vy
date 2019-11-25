# @title Factory
# 
# @notice Controls creation of
# 
# @author Alexander Angel
# 
# @dev Instrument Controller manages this contract
#
# @version 0.1.0b14


struct Asset: # ERC-20 Token
    name: string[64]
    symbol: string[64]
    decimals: uint256
    assetAddress: address

struct AssetPair: # Entangles two Assets
    strike_asset: address
    underlying_asset: address
    ratio: uint256 # Amount of strike tokens relative to 1 underlying token


contract Erc20():
    def totalSupply() -> uint256:constant
    def balanceOf(_owner: address) -> uint256:constant
    def allowance(_owner: address, _spender: address) -> uint256:constant
    def transfer(_to: address, _value: uint256) -> bool:modifying
    def transferFrom(_from: address, _to: address, _value: uint256) -> bool:modifying
    def approve(_spender: address, _value: uint256) -> bool:modifying
    def name() -> string[64]:constant
    def symbol() -> string[64]:constant
    def decimals() -> uint256:constant


name: public(string[64])
assetPair: public(map(string[64], AssetPair))
strikeToken: Erc20
underlyingToken: Erc20
strikeAsset: public(map(string[64], Asset))
underlyingAsset: map(string[64], Asset)



@public
def __init__():
    self.name = 'Factory'



@public
def createPair(_symbol: string[64], _strike: address, _underlying: address, _ratio: uint256) -> AssetPair:
    """
    @dev Creates a struct Asset Pair
    """
    self.strikeToken = Erc20(_strike)
    self.underlyingToken = Erc20(_underlying)
    strikeName: string[64] = self.strikeToken.name()
    strikeSymbol: string[64] = self.strikeToken.symbol()
    strikeDecimals: uint256 = self.strikeToken.decimals()
    self.strikeAsset[_symbol] = Asset({
        name: strikeName, 
        symbol: strikeSymbol, 
        decimals: strikeDecimals,
        assetAddress: _strike,
        })
    underlyingName: string[64] = self.underlyingToken.name()
    underlyingSymbol: string[64] = self.underlyingToken.symbol()
    underlyingDecimals: uint256 = self.underlyingToken.decimals()
    self.underlyingAsset[_symbol] = Asset({
        name: underlyingName, 
        symbol: underlyingSymbol, 
        decimals: underlyingDecimals,
        assetAddress: _underlying,
        })

    self.assetPair[_symbol] = AssetPair({
        strike_asset: _strike,
        underlying_asset: _underlying,
        ratio: _ratio
    })

    return self.assetPair[_symbol]

@public
def getStrikeAsset(_symbol: string[64]) -> (string[64], string[64], uint256, address):
    assetStruct: Asset = self.strikeAsset[_symbol]
    return (assetStruct.name, assetStruct.symbol, assetStruct.decimals, assetStruct.assetAddress)