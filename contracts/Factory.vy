contract pMoat():
    def setup(  strike: uint256,
                underlying: uint256,
                maturity: timestamp,
                _wax_address: address,
                _strike_address: address,
                _underlying_address: address,
                _name: string[64],
                _symbol: string[64],
                ): modifying

contract cMoat():
    def setup(  strike: uint256,
                underlying: uint256,
                maturity: timestamp,
                _wax_address: address,
                _strike_address: address,
                _underlying_address: address,
                _name: string[64],
                _symbol: string[64],
                ): modifying


Newcontract: event({
                contract_addr: indexed(address), 
                strike: uint256,
                underlying: uint256,
                maturity: timestamp,
                })

Error: event({message: string[50]})
Payment: event({amount: wei_value, _from: indexed(address)})

# Contracts
pMoatTemplate: public(address)
cMoatTemplate: public(address)
user_to_cMoat: map(address, address)
user_to_pMoat: map(address, address)
contract_to_user: map(address, address)

# Initial tokens
strike_address: public(address)
underlying_address: public(address)

# Utility
wax_address: public(address)

@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)

@public
def __init__(   _pMoatTemplate: address,
                _cMoatTemplate: address,  
                _strike_address: address, # strike asset denomination
                _underlying_address: address, # underlying asset
                _wax_address: address, 
                ):
    assert self.pMoatTemplate == ZERO_ADDRESS
    assert _pMoatTemplate != ZERO_ADDRESS
    self.pMoatTemplate = _pMoatTemplate
    self.cMoatTemplate = _cMoatTemplate
    self.strike_address = _strike_address
    self.underlying_address = _underlying_address
    self.wax_address = _wax_address
    
    
@public
@payable
def createcMoat(strike: uint256, # cMoat's strike is denominated in strike, Example: 10 strike for 1 Oat.
                underlying: uint256, # cMoat's underlying is Oat
                maturity: timestamp,
                _name: string[64],
                _symbol: string[64],
                ) -> address:
    assert msg.sender != ZERO_ADDRESS
    assert self.cMoatTemplate != ZERO_ADDRESS

    cMoat: address = create_forwarder_to(self.cMoatTemplate)
    _cMoat: address = cMoat
    cMoat(cMoat).setup( strike,
                    underlying,
                    maturity,
                    self.wax_address,
                    self.strike_address,
                    self.underlying_address,
                    _name,
                    _symbol
                    )
    self.user_to_cMoat[msg.sender] = cMoat
    self.contract_to_user[cMoat] = msg.sender
    log.Newcontract(cMoat,
                    strike,
                    underlying,
                    maturity,
                    )
    return cMoat

@public
@payable
def createpMoat(strike: uint256, # cMoat's strike is denominated in strike, Example: 10 strike for 1 Oat.
                underlying: uint256, # cMoat's underlying is Oat
                maturity: timestamp,
                _name: string[64],
                _symbol: string[64],
                ) -> address:
    assert msg.sender != ZERO_ADDRESS
    assert self.pMoatTemplate != ZERO_ADDRESS

    pMoat: address = create_forwarder_to(self.pMoatTemplate)
    _pMoat: address = pMoat
    pMoat(pMoat).setup(strike,
                    underlying,
                    maturity,
                    self.wax_address,
                    self.strike_address,
                    self.underlying_address,
                    _name,
                    _symbol
                    )
    self.user_to_pMoat[msg.sender] = pMoat
    self.contract_to_user[pMoat] = msg.sender
    log.Newcontract(pMoat,
                    strike,
                    underlying,
                    maturity,
                    )
    return pMoat

@public
@constant
def getcMoat(user: address) -> address:
    return self.user_to_cMoat[user]

@public
@constant
def getpMoat(user: address) -> address:
    return self.user_to_pMoat[user]

@public
@constant
def getUser(contract_addr: address) -> address:
    return self.contract_to_user[contract_addr]

