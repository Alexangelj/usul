contract Eco():
    def setup(  buyer: address, 
                vendee: address,
                seller: address,
                vendor: address,
                strike: wei_value,
                notional: wei_value,
                maturity: timedelta
                ): modifying

NewEco: event({
                eco: indexed(address), 
                buyer: indexed(address), 
                vendee: indexed(address), 
                strike: wei_value,
                notional: wei_value,
                maturity: timedelta
                })
Error: event({message: string[50]})

ecoTemplate: public(address)
user_to_eco: map(address, address)
account_to_user: map(address, address)
user_to_eco_to_account: map(address, map(address, address))


@public
def __init__(template: address):
    assert self.ecoTemplate == ZERO_ADDRESS
    assert template != ZERO_ADDRESS
    self.ecoTemplate = template

@public
def createEco(  buyer: address, 
                vendee: address,
                seller: address,
                vendor: address,
                strike: wei_value,
                notional: wei_value,
                maturity: timedelta
                ) -> address:
    assert buyer != ZERO_ADDRESS
    assert self.ecoTemplate != ZERO_ADDRESS
    assert self.user_to_eco[buyer] == ZERO_ADDRESS
    eco: address = create_forwarder_to(self.ecoTemplate)
    _eco: address = eco
    Eco(eco).setup( buyer,
                    vendee,
                    seller,
                    vendor,
                    strike,
                    notional,
                    maturity
                    )
    self.user_to_eco[buyer] = eco
    self.account_to_user[vendee] = buyer
    self.user_to_eco_to_account[buyer][eco] = vendee
    self.user_to_eco[seller] = _eco
    self.account_to_user[vendor] = seller
    self.user_to_eco_to_account[seller][eco] = vendor
    log.NewEco(     eco,
                    buyer,
                    vendee,
                    strike,
                    notional,
                    maturity
                    )
    return eco

@public
@constant
def getEco(user: address) -> address:
    return self.user_to_eco[user]

@public
@constant
def getUser(account: address) -> address:
    return self.account_to_user[account]

@public
@constant
def getAccount(user: address, eco: address) -> address:
    return self.user_to_eco_to_account[user][eco]