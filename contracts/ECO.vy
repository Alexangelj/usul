# @title Emerald Covered Call Option
# @notice Implementation of an American Call Option on the Ethereum Network
# @author Alexander Angel
# @dev Uses a factory to initialize option contracts

contract Factory():
    def getEco(user_addr: address) -> address:constant
    def getUser(eco: address) -> address:constant

Error: event({message: string[50]})
Initialized: event({eco: indexed(address), buyer: indexed(address), seller: indexed(address), outcome: bool})
Authorization: event({user: indexed(address), eco: indexed(address), outcome: bool})
Validation: event({eco: indexed(address), buyer: indexed(address), seller: indexed(address), outcome: bool})
Purchaser: event({user: indexed(address), eco: indexed(address), amount: wei_value, outcome: bool})
Writer: event({user: indexed(address), eco: indexed(address), amount: wei_value, outcome: bool})
Withdrawal: event({user: indexed(address), eco: indexed(address), amount: wei_value, outcome: bool})
Exercise: event({user: indexed(address), eco: indexed(address), outcome: bool})
Settlement: event({user: indexed(address), eco: indexed(address), amount: wei_value, outcome: bool})
Payment: event({amount: wei_value, source: indexed(address)})
Cashflow: event({user: indexed(address), eco: indexed(address), amount: wei_value, outcome: bool})
Mature: event({eco: indexed(address), stamp: timestamp, outcome: bool})


factory: Factory
user: address
buyer: public(address)
seller: public(address)
strike: public(wei_value)
notional: public(uint256)
maturity: public(timedelta)
margin: public(wei_value)
active: public(bool)
completed: public(bool)
isAuthed: map(address, bool)
claimedBalance: public(map(address, wei_value))
premium: public(wei_value)
expiration: public(timestamp)


@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)
# @notice Initializer
# @params buyer:address, seller:address, underlier:wei, strikePrice:wei, notional:uint256, maturity:timedelta
@public
def setup(  _buyer: address, 
            _seller: address,
            _strike: wei_value,
            _notional: uint256,
            _maturity: timedelta,
            _margin: wei_value
            ):
    """
    @notice Setup is called from the factory contract using an ECO contract template address
    @params buyer:address, seller:address, underlier:wei, strikePrice:wei, notional:uint256, maturity:timedelta
    """
    assert(self.factory == ZERO_ADDRESS and self.user == ZERO_ADDRESS) and msg.sender != ZERO_ADDRESS
    self.factory = Factory(msg.sender)
    self.buyer = _buyer
    self.seller = _seller
    self.strike = _strike
    self.notional = _notional
    self.maturity = _maturity
    self.margin = _margin
    self.active = False
    self.completed = False
    self.claimedBalance[self.buyer] = 0
    self.claimedBalance[self.seller] = 0
    self.premium = as_wei_value(3, 'ether')
    self.expiration = block.timestamp + (60 * 60 * 24 * self.maturity)
    log.Initialized(self, self.buyer, self.seller, True)

@public
def isMature() -> bool:
    """
    @notice ECOs have a time to expiration, this checks if it has expired
    """
    if(block.timestamp >= self.expiration):
        log.Mature(self, self.expiration, True)
        return True
    else:
        log.Mature(self, self.expiration, False)
        return False

@public
@payable
def purchase() -> bool:
    """
    @notice Buyer purchases ECO for Premium:wei, Seller can claim Premium, Buyer is authorized
    """
    if(msg.sender == self.buyer):
        self.isAuthed[self.buyer] = True
        self.claimedBalance[self.seller] = msg.value
        log.Cashflow(self.buyer, self, msg.value, True)
        log.Purchaser(self.buyer, self, msg.value, True)
        return self.isAuthed[self.buyer]
    else:
        log.Error('Msg.sender != Buyer')
        return False

@public
@payable
def write() -> bool:
    """
    @notice Seller writes ECO Contract, Deposits margin, Seller is authorized
    """
    if(msg.sender == self.seller and msg.value == self.margin):
        log.Cashflow(self.seller, self, msg.value, True)
        self.isAuthed[self.seller] = True
        log.Writer(self.seller, self, msg.value, True)
        return self.isAuthed[self.seller]
    else:
        log.Error('Msg.sender != Buyer')
        return False

@public
def validate() -> bool:
    """
    @notice Checks if inactive, Checks Buyer & Seller's Authorization, Sends Premium to Seller, Activates Contract
    """
    if(self.active or self.completed):
        log.Error('Should be Inactive Log')
        return True
    
    if(not self.isAuthed[self.buyer]):
        log.Error('Need Authorized buyer')
        return False
    
    if(not self.isAuthed[self.seller]):
        log.Error('Need Authorized seller')
        return False
    if(self.claimedBalance[self.seller] > 0):
        log.Cashflow(self.seller, self, self.claimedBalance[self.seller], True)
        send(self.seller, self.claimedBalance[self.seller])
    self.active = True
    log.Validation(self, self.buyer, self.seller, True)
    return True

@public
@payable
def exercise() -> bool:
    """
    @notice If called from Buyer, Sends price * notional Ether to Buyer, Sends strike * notional to Seller, Completes
    """
    if(msg.sender == self.seller):
        log.Error('Exercise Call must be from Buyer')
        return False
    if(msg.sender == self.buyer):
        """
        This is where cash dispersement is handled
        ECO tx -> send buyer: current price * notional
        ECO tx -> send seller: strike * notional + margin
        ECO deactivated and completed
        """
        assert self.active
        val: wei_value = as_wei_value(20, 'ether')
        strik: wei_value = as_wei_value(10, 'ether')
        log.Exercise(self.buyer, self, True)
        log.Cashflow(self.buyer, self, val, True)
        send(self.buyer, val)
        log.Cashflow(self.seller, self, self.margin - val + as_wei_value(self.strike, 'ether'), True)
        send(self.seller, self.margin - val + as_wei_value(self.strike, 'ether'))
        self.active = False
        self.completed = True
        return True
    else:
        log.Error('Exercise attempt returns False')
        return False