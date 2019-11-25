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


contract GenesisToken():
    def setup(
        _name: string[64],
        _symbol: string[64],
        _decimals: uint256,
        _supply: uint256,
        _expiration: timestamp,
    ):modifying


name: public(string[64])
user_to_genesisToken: public(map(address, address))



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

@public
def createToken(
        _name: string[64],
        _symbol: string[64],
        _decimals: uint256,
        _supply: uint256,
        _template: address,
        _expiration: timestamp
    ) -> address:
    assert msg.sender != ZERO_ADDRESS
    assert _template != ZERO_ADDRESS

    genesisToken: address = create_forwarder_to(_template)
    GenesisToken(genesisToken).setup( 
        _name,
        _symbol,
        _decimals,
        _supply,
        _expiration
    )
    self.user_to_genesisToken[msg.sender] = genesisToken
    return genesisToken