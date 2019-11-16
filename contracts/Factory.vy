contract Omn():
    def setup(  strike: uint256,
                underlying: uint256,
                maturity: timestamp,
                _slate_address: address,
                _stash_address: address,
                _wax_address: address,
                _dai_address: address,
                _oat_address: address,
                ): modifying


Newomn: event({
                omn: indexed(address), 
                strike: uint256,
                underlying: uint256,
                maturity: timestamp,
                })

Error: event({message: string[50]})
Payment: event({amount: wei_value, _from: indexed(address)})

omnTemplate: public(address)
user_to_omn: map(address, address)
omn_to_user: map(address, address)

# Initial tokens
dai_address: public(address)
oat_address: public(address)
# Repositories
stash40_address: public(address)
slate40_address: public(address)
# Utility
wax_address: public(address)

@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)

@public
def __init__(   _omnTemplate: address,  
                _dai_address: address, # strike asset denomination
                _oat_address: address, # underlying asset
                _slate40_address: address, # strike asset storage
                _stash40_address: address, # underlying asset storage
                _wax_address: address, 
                ):
    assert self.omnTemplate == ZERO_ADDRESS
    assert _omnTemplate != ZERO_ADDRESS
    self.omnTemplate = _omnTemplate
    self.dai_address = _dai_address
    self.oat_address = _oat_address
    self.slate40_address = _slate40_address
    self.stash40_address = _stash40_address
    self.wax_address = _wax_address
    
@public
@payable
def createOmn(  strike: uint256, # Omn's strike is denominated in Dai, Example: 10 dai for 1 Oat.
                underlying: uint256, # Omn's underlying is Oat
                maturity: timestamp,
                ) -> address:
    assert msg.sender != ZERO_ADDRESS
    assert self.omnTemplate != ZERO_ADDRESS

    omn: address = create_forwarder_to(self.omnTemplate)
    _omn: address = omn
    Omn(omn).setup( strike,
                    underlying,
                    maturity,
                    self.slate40_address,
                    self.stash40_address,
                    self.wax_address,
                    self.dai_address,
                    self.oat_address,
                    )
    self.user_to_omn[msg.sender] = omn
    self.omn_to_user[omn] = msg.sender
    log.Newomn(     omn,
                    strike,
                    underlying,
                    maturity,
                    )
    return omn


@public
@constant
def getOmn(user: address) -> address:
    return self.user_to_omn[user]

@public
@constant
def getUser(omn: address) -> address:
    return self.omn_to_user[omn]

