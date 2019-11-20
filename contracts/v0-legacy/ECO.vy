# @title Emerald Covered Call Option
# 
# @notice Implementation of an American Call Option on the Ethereum Network
# 
# @author Alexander Angel
# 
# @dev Uses a factory to initialize and deploy option contracts

contract Factory():
    def getEco(user_addr: address) -> address:constant
    def getUser(eco: address) -> address:constant

contract Oracle():
    def currentAnswer() -> int128:constant
    def updatedHeight() -> uint256:constant

contract Slate():
    def bought(addr: address) -> address:constant
    def premium(addr: address) -> uint256:constant
    def write(_option: address, prm: uint256, margin: uint256) -> bool:modifying
    def purchase(_option: address, prm: uint256) -> bool:modifying
    def withdraw(val: uint256) -> bool:modifying

contract Stash():
    def fund(addr: address) -> uint256:constant
    def deposit(_writer: address, margin: uint256) -> bool:modifying
    def withdraw(val: uint256) -> bool:modifying
    
contract Wax():
    def timeToExpiry(time: timestamp) -> bool:modifying
    


Valid: event({eco: indexed(address)})
Buy: event({eco: indexed(address)})
Write: event({eco: indexed(address)})
Exercise: event({eco: indexed(address)})
Mature: event({eco: indexed(address)})
Oracle: event({spot_price: uint256})
Payment: event({amount: wei_value, source: indexed(address)})


factory: Factory
oracle: Oracle

# New
slate: public(Slate)
stash: public(Stash)
wax: public(Wax)


user: address

# ECO parameters
buyer: public(address)
seller: public(address)
strike: public(uint256)
notional: public(uint256)
maturity: public(timedelta)
margin: public(uint256)

strikepot: public(uint256) # strike price * notional -> wei
jackpot: public(uint256) # spot price * notional -> wei
stub: public(uint256) # margin - jackpot + strikepot -> wei, sent to writer
active: public(bool)
completed: public(bool)
expiration: public(timestamp)
spot: public(uint256)
oracle_address: public(address)
stash_address: public(address)
raw_value: bytes[32]


@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)

@public
def setup(  _buyer: address, 
            _seller: address,
            _strike: uint256,
            _notional: uint256,
            _maturity: timedelta,
            _margin: uint256,
            _oracle_address: address,
            _slate_address: address,
            _stash_address: address,
            _wax_address: address,
            ):
    """
    @notice Setup is called from the factory contract using an ECO contract template address
    """
    assert(self.factory == ZERO_ADDRESS and self.user == ZERO_ADDRESS) and msg.sender != ZERO_ADDRESS
    self.factory = Factory(msg.sender)
    self.oracle_address = _oracle_address
    self.buyer = _buyer
    self.seller = _seller
    self.strike = _strike
    self.notional = _notional
    self.maturity = _maturity
    self.margin = _margin

    self.expiration = block.timestamp + (60 * 60 * 24 * self.maturity)
    self.strikepot = self.strike * self.notional
    self.jackpot = self.notional * self.strike
    self.stub = self.margin - self.jackpot + self.strikepot

    self.active = False
    self.completed = False

    # New
    self.slate = Slate(_slate_address)
    self.stash = Stash(_stash_address)
    self.wax = Wax(_wax_address)

@public
def isMature() -> bool:
    """
    @notice ECOs have a time to expiration, this checks if it has expired
    """
    #if(block.timestamp >= self.expiration):
    #    log.Mature(self)
    #    return True
    #else:
    #    log.Mature(self)
    #    return False
    
    # New
    return self.wax.timeToExpiry(self.expiration)


@public
def getSpotPrice() -> uint256:
    self.raw_value = raw_call(self.oracle_address, method_id('getLatestUpdatedHeight()', bytes[4]), outsize=32, gas=msg.gas)
    self.spot = convert(self.raw_value, uint256)
    log.Oracle(self.spot)
    return self.spot

@public
@payable
def purchase(_option: address, prm: uint256) -> bool:
    """
    @notice Buyer purchases ECO for Premium:wei, Seller can claim Premium, Buyer is authorized
    """
    send(self.slate, msg.value)
    log.Buy(self)
    return self.slate.purchase(_option, prm)

    #````
    # CAN DELETE
    #if(msg.sender == self.buyer):
    #    self.isAuthed[self.buyer] = True
    #    ```self.claimedBalance[self.seller] = msg.value
    #    log.Cashflow(self.buyer, self, msg.value, True)
    #    log.Purchaser(self.buyer, self, msg.value, True)
    #    return self.isAuthed[self.buyer]
    #else:
    #    log.Error('Msg.sender != Buyer')
    #    return False

@public
@payable
def write(_option: address, prm: uint256, _margin: uint256) -> bool:
    """
    @notice Seller writes ECO Contract, Deposits margin, Seller is authorized
    """
    send(self.stash, msg.value)
    log.Write(self)
    return self.slate.write(_option, prm, _margin)
    
    #````
    # CAN DELETE
    #if(msg.sender == self.seller and msg.value == self.margin):
    #    log.Cashflow(self.seller, self, msg.value, True)
    #    self.isAuthed[self.seller] = True
    #    log.Writer(self.seller, self, msg.value, True)
    #    return self.isAuthed[self.seller]
    #else:
    #    log.Error('Msg.sender != Buyer')
    #    return False

@public
def validate() -> bool:
    """
    @notice Checks if inactive, Checks Buyer & Seller's Authorization, Sends Premium to Seller, Activates Contract
    """
    #```` CAN DELETE
    # if(self.active or self.completed):
    #    log.Error('Should be Inactive Log')
    #    return True
    # 
    # if(not self.isAuthed[self.buyer]):
    #     log.Error('Need Authorized buyer')
    #     return False
    # 
    # if(not self.isAuthed[self.seller]):
    #     log.Error('Need Authorized seller')
    #     return False
    #```if(self.claimedBalance[self.seller] > 0):
    #    log.Cashflow(self.seller, self, self.claimedBalance[self.seller], True)
    #    send(self.seller, self.claimedBalance[self.seller])

    # New
    assert not self.active, 'Should be inactive'
    assert not self.completed, 'Shouldnt be completed'
    assert self.stash.fund(self.seller) >= self.margin
    assert self.slate.bought(self) == self.buyer
    assert self.slate.premium(self.buyer) >= 1 # fix the '1' with premium

    self.slate.withdraw(1) # 1 is premium, FIX
    self.active = True
    log.Valid(self)
    return True

@public
@payable
def exercise() -> bool:
    """
    @notice If called from Buyer, Sends price * notional Ether to Buyer, Sends strike * notional to Seller, Completes
    """
    
    # ``` CAN DELETE`
    # if(msg.sender == self.seller):
    #     log.Error('Exercise Call must be from Buyer')
    #     return False
    #if(msg.sender == self.buyer and self.jackpot >= self.strikepot):
    #    """
    #    This is where cash dispersement is handled
    #    ECO tx -> send buyer: current price * notional
    #    ECO tx -> send seller: strike * notional + margin
    #    ECO deactivated and completed
    #    """
    #    assert self.active
    #    log.Exercise(self.buyer, self, True)
    #    log.Cashflow(self.buyer, self, self.jackpot, True)
    #    send(self.buyer, self.jackpot)
    #    log.Cashflow(self.seller, self, self.stub, True)
    #    send(self.seller, self.stub)
    #    self.active = False
    #    self.completed = True
    #    return True
    #else:
    #    log.Error('Exercise attempt returns False')
    #    return False

    # News
    assert self.active
    assert not msg.sender == self.seller
    assert msg.sender == self.buyer
    assert self.jackpot >= self.strikepot

    # self.slate.withdraw(1) # this val is jackpot was withdrawing the premium paid on exercise, should be paid at validation
    self.stash.withdraw(3) # this val is stub

    self.active = False
    self.completed = True
    log.Exercise(self)
    return True
