contract Zod():
    def setup(  strike: uint256,
                underlying: uint256,
                maturity: timestamp,
                _wax_address: address,
                _dai_address: address,
                _oat_address: address,
                ): modifying

contract Doz():
    def setup(  strike: uint256,
                underlying: uint256,
                maturity: timestamp,
                _wax_address: address,
                _dai_address: address,
                _oat_address: address,
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
zodTemplate: public(address)
dozTemplate: public(address)
user_to_doz: map(address, address)
user_to_zod: map(address, address)
contract_to_user: map(address, address)

# Initial tokens
dai_address: public(address)
oat_address: public(address)

# Utility
wax_address: public(address)

@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)

@public
def __init__(   _zodTemplate: address,
                _dozTemplate: address,  
                _dai_address: address, # strike asset denomination
                _oat_address: address, # underlying asset
                _wax_address: address, 
                ):
    assert self.zodTemplate == ZERO_ADDRESS
    assert _zodTemplate != ZERO_ADDRESS
    self.zodTemplate = _zodTemplate
    self.dozTemplate = _dozTemplate
    self.dai_address = _dai_address
    self.oat_address = _oat_address
    self.wax_address = _wax_address
    
    
@public
@payable
def createDoz(  strike: uint256, # doz's strike is denominated in Dai, Example: 10 dai for 1 Oat.
                underlying: uint256, # doz's underlying is Oat
                maturity: timestamp,
                ) -> address:
    assert msg.sender != ZERO_ADDRESS
    assert self.dozTemplate != ZERO_ADDRESS

    doz: address = create_forwarder_to(self.dozTemplate)
    _doz: address = doz
    Doz(doz).setup( strike,
                    underlying,
                    maturity,
                    self.wax_address,
                    self.dai_address,
                    self.oat_address,
                    )
    self.user_to_doz[msg.sender] = doz
    self.contract_to_user[doz] = msg.sender
    log.Newcontract(doz,
                    strike,
                    underlying,
                    maturity,
                    )
    return doz

@public
@payable
def createZod(  strike: uint256, # doz's strike is denominated in Dai, Example: 10 dai for 1 Oat.
                underlying: uint256, # doz's underlying is Oat
                maturity: timestamp,
                ) -> address:
    assert msg.sender != ZERO_ADDRESS
    assert self.zodTemplate != ZERO_ADDRESS

    zod: address = create_forwarder_to(self.zodTemplate)
    _zod: address = zod
    Zod(zod).setup( strike,
                    underlying,
                    maturity,
                    self.wax_address,
                    self.dai_address,
                    self.oat_address,
                    )
    self.user_to_zod[msg.sender] = zod
    self.contract_to_user[zod] = msg.sender
    log.Newcontract(zod,
                    strike,
                    underlying,
                    maturity,
                    )
    return zod

@public
@constant
def getDoz(user: address) -> address:
    return self.user_to_doz[user]

@public
@constant
def getZod(user: address) -> address:
    return self.user_to_zod[user]

@public
@constant
def getUser(contract_addr: address) -> address:
    return self.contract_to_user[contract_addr]

