contract Eco():
    def setup(  buyer: address, 
                seller: address,
                strike: wei_value,
                notional: uint256,
                maturity: timedelta,
                margin: wei_value
                ): modifying

NewEco: event({
                eco: indexed(address), 
                buyer: indexed(address), 
                strike: wei_value,
                notional: uint256,
                maturity: timedelta,
                margin: wei_value
                })
Error: event({message: string[50]})
Payment: event({amount: wei_value, _from: indexed(address)})

ecoTemplate: public(address)
user_to_eco: map(address, address)
eco_to_user: map(address, address)

@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)

@public
def __init__(template: address):
    assert self.ecoTemplate == ZERO_ADDRESS
    assert template != ZERO_ADDRESS
    self.ecoTemplate = template

@public
@payable
def createEco(  buyer: address, 
                seller: address,
                strike: wei_value,
                notional: uint256,
                maturity: timedelta,
                margin: wei_value
                ) -> address:
    assert buyer != ZERO_ADDRESS
    assert self.ecoTemplate != ZERO_ADDRESS
    assert self.user_to_eco[buyer] == ZERO_ADDRESS
    eco: address = create_forwarder_to(self.ecoTemplate)
    _eco: address = eco
    Eco(eco).setup( buyer,
                    seller,
                    strike,
                    notional,
                    maturity,
                    margin
                    )
    self.user_to_eco[buyer] = eco
    self.user_to_eco[seller] = _eco
    self.eco_to_user[eco] = buyer
    self.eco_to_user[_eco] = seller
    log.NewEco(     eco,
                    buyer,
                    strike,
                    notional,
                    maturity,
                    margin
                    )
    return eco

@public
@constant
def getEco(user: address) -> address:
    return self.user_to_eco[user]

@public
@constant
def getUser(eco: address) -> address:
    return self.eco_to_user[eco]

