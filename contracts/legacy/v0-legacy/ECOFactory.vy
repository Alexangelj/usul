contract Eco():
    def setup(  buyer: address, 
                seller: address,
                strike: uint256,
                notional: uint256,
                maturity: timestamp,
                margin: uint256,
                _oracle_address: address,
                _slate_address: address,
                _stash_address: address,
                _wax_address: address,
                ): modifying

contract Arc():
    def setup(  strike: uint256,
                notional: uint256,
                maturity: timestamp,
                margin: uint256,
                _token_address: address,
                _slate_address: address,
                _stash_address: address,
                _wax_address: address,
                ): modifying

contract Arp():
    def setup(  strike: uint256,
                notional: uint256,
                maturity: timestamp,
                margin: uint256,
                _token_address: address,
                _slate_address: address,
                _stash_address: address,
                _wax_address: address,
                ): modifying

NewEco: event({
                eco: indexed(address), 
                buyer: indexed(address), 
                strike: wei_value,
                notional: uint256,
                maturity: timestamp,
                margin: wei_value,
                _oracle_address: address
                })

Error: event({message: string[50]})
Payment: event({amount: wei_value, _from: indexed(address)})

ecoTemplate: public(address)
arcTemplate: public(address)
arpTemplate: public(address)
user_to_eco: map(address, address)
eco_to_user: map(address, address)

# New
token_address: public(address)
oracle_address: public(address)
slate_address: public(address)
stash_address: public(address)
wax_address: public(address)
stash20_address: public(address)
slate20_address: public(address)

@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)

@public
def __init__(   template: address, 
                arc_template: address,
                arp_template: address, 
                _token_address: address, 
                _oracle_address: address, 
                _slate_address: address, 
                _stash_address: address, 
                _wax_address: address, 
                _stash20_address: address,
                _slate20_address: address,
                ):
    assert self.ecoTemplate == ZERO_ADDRESS
    assert template != ZERO_ADDRESS
    assert self.arcTemplate == ZERO_ADDRESS
    assert arc_template != ZERO_ADDRESS
    self.ecoTemplate = template
    self.arcTemplate = arc_template
    self.arpTemplate = arp_template
    self.token_address = _token_address
    self.oracle_address = _oracle_address
    self.slate_address = _slate_address
    self.stash_address = _stash_address
    self.wax_address = _wax_address
    self.stash20_address = _stash20_address
    self.slate20_address = _slate20_address

@public
@payable
def createEco(  buyer: address, 
                seller: address,
                strike: uint256,
                notional: uint256,
                maturity: timestamp,
                margin: uint256,
                token: bool,
                ) -> address:
    assert buyer != ZERO_ADDRESS
    assert self.ecoTemplate != ZERO_ADDRESS
    assert self.user_to_eco[buyer] == ZERO_ADDRESS
    assert self.arcTemplate != ZERO_ADDRESS

    if(token):
        arc: address = create_forwarder_to(self.arcTemplate)
        _arc: address = arc
        Arc(arc).setup( strike,
                        notional,
                        maturity,
                        margin,
                        self.token_address,
                        self.slate20_address,
                        self.stash20_address,
                        self.wax_address,
        )
        self.user_to_eco[buyer] = arc
        self.user_to_eco[seller] = arc
        self.eco_to_user[arc] = buyer
        self.eco_to_user[arc] = seller
        return arc

    eco: address = create_forwarder_to(self.ecoTemplate)
    _eco: address = eco
    Eco(eco).setup( buyer,
                    seller,
                    strike,
                    notional,
                    maturity,
                    margin,
                    self.oracle_address,
                    self.slate_address,
                    self.stash_address,
                    self.wax_address,
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
                    margin,
                    self.oracle_address
                    )
    return eco

@public
@payable
def createArp(  buyer: address, 
                seller: address,
                strike: uint256,
                notional: uint256,
                maturity: timestamp,
                margin: uint256,
                token: bool,
                ) -> address:
    assert buyer != ZERO_ADDRESS
    assert self.ecoTemplate != ZERO_ADDRESS
    assert self.user_to_eco[buyer] == ZERO_ADDRESS
    assert self.arpTemplate != ZERO_ADDRESS

    if(token):
        arp: address = create_forwarder_to(self.arpTemplate)
        _arp: address = arp
        Arp(arp).setup( strike,
                        notional,
                        maturity,
                        margin,
                        self.token_address,
                        self.slate20_address,
                        self.stash20_address,
                        self.wax_address,
        )
        self.user_to_eco[buyer] = arp
        self.user_to_eco[seller] = arp
        self.eco_to_user[arp] = buyer
        self.eco_to_user[arp] = seller
        return arp

    eco: address = create_forwarder_to(self.ecoTemplate)
    _eco: address = eco
    Eco(eco).setup( buyer,
                    seller,
                    strike,
                    notional,
                    maturity,
                    margin,
                    self.oracle_address,
                    self.slate_address,
                    self.stash_address,
                    self.wax_address,
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
                    margin,
                    self.oracle_address
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

