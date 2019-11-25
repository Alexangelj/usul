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
    strike_asset: Asset
    underlying_asset: Asset
    ratio: uint256 # Amount of strike tokens relative to 1 underlying token


name: public(string[64])


@public
def __init__():
    self.name = 'Factory'

@public
def pairTest() -> bool:
    pair: AssetPair = AssetPair({
        strike_asset: Asset({
            name:'1', 
            symbol: '1', 
            decimals: 10**18,
            assetAddress: self,
        }),
        underlying_asset: Asset({
            name:'1', 
            symbol: '1', 
            decimals: 10**18,
            assetAddress: self,
        }),
        ratio: 10**10,
    })
    return True