# @title A Right to Call - Physically Settled ERC 20 Token
# 
# @notice Implementation of an American Call Option on the Ethereum Network
# 
# @author Alexander Angel
# 
# @dev Uses a factory to initialize and deploy option contracts
#
# @version 0.1.0b14


contract Factory():
    def getEco(user_addr: address) -> address:constant
    def getUser(eco: address) -> address:constant

contract Slate():
    def bought(_option: address) -> address:constant
    def wrote(_option: address) -> address:constant
    def premium(_option: address) -> uint256:constant
    def write(_option: address, prm: uint256, margin: uint256) -> bool:modifying
    def purchase(_option: address, prm: uint256) -> bool:modifying
    def withdraw(val: uint256) -> bool:modifying

contract Stash():
    def fund(addr: address) -> uint256:constant
    def deposit(_writer: address, margin: uint256) -> bool:modifying
    def withdraw(val: uint256) -> bool:modifying
    
contract Wax():
    def timeToExpiry(time: timestamp) -> bool:constant
    
contract Dai():
    def totalSupply() -> uint256:constant
    def balanceOf(_owner: address) -> uint256:constant
    def allowance(_owner: address, _spender: address) -> uint256:constant
    def transfer(_to: address, _value: uint256) -> bool:modifying
    def transferFrom(_from: address, _to: address, _value: uint256) -> bool:modifying
    def approve(_spender: address, _value: uint256) -> bool:modifying


Valid: event({eco: indexed(address)})
Buy: event({eco: indexed(address)})
Write: event({eco: indexed(address)})
Exercise: event({eco: indexed(address)})
Mature: event({eco: indexed(address)})
Payment: event({amount: wei_value, source: indexed(address)})
Transfer: event({_from: indexed(address), _to: indexed(address), _value: uint256})
Approval: event({_owner: indexed(address), _spender: indexed(address), _value: uint256})

# Can delete
Error: event({fund: uint256, margn: uint256})


# Interface Contracts
factory: public(Factory)
slate: public(Slate)
stash: public(Stash)
wax: public(Wax)
dai: public(Dai)

user: address

# Contract parameters
strike: public(uint256)
notional: public(uint256)
maturity: public(timestamp)

# Exercise Conditions
active: public(bool)
completed: public(bool)
expiration: public(timestamp)


@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)

@public
def setup(  _strike: uint256,
            _notional: uint256,
            _maturity: timestamp,
            _margin: uint256,
            _token_address: address,
            _slate_address: address,
            _stash_address: address,
            _wax_address: address,
            ):
    """
    @notice Setup is called from the factory contract using an ECO contract template address
    """
    assert(self.factory == ZERO_ADDRESS and self.user == ZERO_ADDRESS) and msg.sender != ZERO_ADDRESS
    self.factory = Factory(msg.sender)
    
    self.strike = _strike
    self.notional = _notional
    self.maturity = _maturity

    
    

    self.active = False
    self.completed = False

    # New
    self.slate = Slate(_slate_address)
    self.stash = Stash(_stash_address)
    self.wax = Wax(_wax_address)
    self.dai = Dai(_token_address)
    
    self.expiration = block.timestamp + (60 * 60 * 24 * 1)
    self.dai.approve(self.stash, 1000000000000000*10**18)


# Need to fix, constant function? Or modifying function? How do I liquidate mature contracts?
@public
@constant
def isMature() -> bool:
    """
    @notice ECOs have a time to expiration, this checks if it has expired
    """
    return self.wax.timeToExpiry(self.maturity)

@public
@payable
def purchase(prm: uint256) -> bool:
    """
    @notice Buyer purchases ECO for Premium:wei, Seller can claim Premium, Buyer is authorized
    """
    send(self.slate, msg.value)
    log.Buy(self)
    return self.slate.purchase(self, prm)

@public
@payable
def write(prm: uint256, _margin: uint256) -> bool:
    """
    @notice Seller writes ECO Contract, Deposits margin, Seller is authorized
    """
    self.dai.transferFrom(msg.sender, self.stash, _margin)
    log.Write(self)
    return self.slate.write(self, prm, _margin)

# Need to build DEX first
# @public
# @payable
# def purchaseClose(prm: uint256) -> bool:
#     """
#     @notice -   A writer can purchase their contract back to effectively close it - i.e. buy the obligation
#     """
#     assert self.active
#     assert msg.sender == self.slate.wrote(self)
#     send(self.slate, msg.value) # Send the premium price to the Slate
#     self.dai.transferFrom(  self.stash, # Transfer margin from Stash
#                             msg.sender, # To Original writer
#                             self.stash.fund(self.slate.wrote(self))) # Look up margin value, by looking up who wrote the option
#     return self.slate.purchase(self, prm) # Update the slate to show a purchase order has been submitted
#     
# 
# @public
# @payable
# def sellClose() -> bool:
#     """
#     @notice -   The Original purchaser may want to sell their option because the premium has appreciated.
#     """
#     assert self.active
#     assert msg.sender == self.slate.bought(self) # Asserts the sellClose order comes from someone who owns the option
#     self.slate.write(   self, # Updates the slate with a new write
#                         self.slate.premium(self.slate.bought(self)), # looks up premium, by looking up who purchased the option
#                         self.stash.fund(self.slate.wrote(self))) # Looks up the margin, by looking up who wrote the option
#     return self.slate.withdraw(self.slate.premium(self.slate.wrote(self))) # Purchase to Close offer withdraws the premium, by looking up who wrote the option


@public
def validate() -> bool:
    """
    @notice Checks if inactive, Checks Buyer & Seller's Authorization, Sends Premium to Seller, Activates Contract
    """
    assert not self.active, 'Should be inactive'
    assert not self.completed, 'Shouldnt be completed'
    assert self.stash.fund(self.slate.wrote(self)) > 0 # Looks up margin
    assert self.slate.premium(self.slate.bought(self)) > 0 # Looks up premium

    # This tx looks confusing but it's not, it's just looking up what the premium is.
    # Calling withdraw function of slate, which transfers an amt defined in parameter to the tx.origin of this tx
    # The argument is looking up the premium value by looking up the buyer
    # It's looking up the buyer by using this option's address, which is a map in slate.
    self.slate.withdraw(self.slate.premium(self.slate.bought(self))) # Slate payment to writer equal to premium paid

    self.active = True
    log.Valid(self)
    return True

@public
@payable
def exercise() -> bool:
    """
    @notice If called from Buyer, Sends price * notional Ether to Buyer, Sends strike * notional to Seller, Completes
    """
    assert self.active
    assert msg.sender == self.slate.bought(self)

    send(self.slate, msg.value) # Purchase of underlying asset * notional amount @ strike price is sent to Slate
    self.slate.withdraw(self.strike * self.notional) # Writer receives payment from Slate
    self.stash.withdraw(self.stash.fund(self.slate.wrote(self))) # Purchaser receives underlying asset * notional amount

    self.active = False
    self.completed = True
    log.Exercise(self)
    return True
