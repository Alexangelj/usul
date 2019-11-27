# @title Factory
# 
# @notice Controls creation of
# 
# @author Alexander Angel
# 
# @dev Instrument Controller manages this contract
#
# @version 0.1.0b14



contract Genesis():
    def setup(     
        _controller: address,
        _name: string[64],
        _symbol: string[64],
        _ratio: uint256,
        _strike_address: address,
        _underlying_address: address,
        _set: timestamp[4],
        _tokens: address[4]
    ): modifying


Newcontract: event({
                contract_addr: indexed(address), 
                strike: uint256,
                })

Error: event({message: string[50]})
Payment: event({amount: wei_value, _from: indexed(address)})


name: public(string[64])
genesisTemplate: address
user_to_genesis: map(address, address)
contract_to_user: map(address, address)

FIRST: constant(string[5]) = 'First'
SECOND: constant(string[6]) = 'Second'
THIRD: constant(string[5]) = 'Third'
FOURTH: constant(string[6]) = 'Fourth'


@public
def __init__(_genesisTemplate: address):
    self.name = 'Factory'
    self.genesisTemplate = _genesisTemplate


@public
def createInstrument(
        _controller: address,
        _name: string[64],
        _symbol: string[64],
        _ratio: uint256,
        _saddr: address,
        _uaddr: address,
        _set: timestamp[4],
        _tokens: address[4],
    ) -> address:
    assert msg.sender != ZERO_ADDRESS
    assert self.genesisTemplate != ZERO_ADDRESS

    genesis: address = create_forwarder_to(self.genesisTemplate)
    _genesis: address = genesis
    Genesis(genesis).setup(
        _controller, 
        _name,
        _symbol,
        _ratio,
        _saddr,
        _uaddr,
        _set,
        _tokens,
    )
    self.user_to_genesis[msg.sender] = genesis
    self.contract_to_user[genesis] = msg.sender
    log.Newcontract(genesis,
                    _ratio,
                    )
    return genesis