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
    def purchase(_option: address, prm: uint256) -> bool:modifying

Error: event({message: string[50]})
Initialized: event({eco: indexed(address), buyer: indexed(address), seller: indexed(address), outcome: bool})
Validation: event({eco: indexed(address), buyer: indexed(address), seller: indexed(address), outcome: bool})
Purchaser: event({user: indexed(address), eco: indexed(address), amount: wei_value, outcome: bool})
Writer: event({user: indexed(address), eco: indexed(address), amount: wei_value, outcome: bool})
Withdrawal: event({user: indexed(address), eco: indexed(address), amount: wei_value, outcome: bool})
Exercise: event({user: indexed(address), eco: indexed(address), outcome: bool})
Settlement: event({user: indexed(address), eco: indexed(address), amount: wei_value, outcome: bool})
Payment: event({amount: wei_value, source: indexed(address)})
Cashflow: event({user: indexed(address), eco: indexed(address), amount: wei_value, outcome: bool})
Mature: event({eco: indexed(address), stamp: timestamp, outcome: bool})
Oracle: event({user: indexed(address), eco: indexed(address), oracle_address: indexed(address), spot_price: wei_value, outcome: bool})


factory: Factory
oracle: Oracle
slate: public(Slate)
user: address

# ECO parameters
buyer: public(address)
seller: public(address)
strike: public(wei_value)
notional: public(uint256)
maturity: public(timedelta)
margin: public(wei_value)

strikepot: public(wei_value) # strike price * notional -> wei
jackpot: public(wei_value) # spot price * notional -> wei
stub: public(wei_value) # margin - jackpot + strikepot -> wei, sent to writer
active: public(bool)
completed: public(bool)
isAuthed: map(address, bool)
claimedBalance: public(map(address, wei_value))
premium: public(wei_value)
expiration: public(timestamp)
spot: public(wei_value)
oracle_address: public(address)
raw_value: bytes[32]
gas_test: uint256
gas_test2: uint256
gas_test3: uint256


@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)

@public
def setup(  _buyer: address, 
            _seller: address,
            _strike: wei_value,
            _notional: uint256,
            _maturity: timedelta,
            _margin: wei_value,
            _oracle_address: address,
            _slate_address: address
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

    self.premium = as_wei_value(0.1, 'ether')
    self.expiration = block.timestamp + (60 * 60 * 24 * self.maturity)
    self.strikepot = self.strike * self.notional
    self.jackpot = as_wei_value(4, 'ether')
    self.stub = self.margin - self.jackpot + self.strikepot

    self.active = False
    self.completed = False
    self.claimedBalance[self.buyer] = 0
    self.claimedBalance[self.seller] = 0

    self.gas_test = 10
    self.gas_test2 = 20

    log.Initialized(self, self.buyer, self.seller, True)


    # New
    self.slate = Slate(_slate_address)

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
def getSpotPrice() -> wei_value:
    self.raw_value = raw_call(self.oracle_address, method_id('getLatestUpdatedHeight()', bytes[4]), outsize=32, gas=msg.gas)
    self.spot = as_wei_value(convert(self.raw_value, int128), 'ether')
    log.Oracle(msg.sender, self, self.oracle_address, self.spot, True)
    return self.spot

@public
@payable
def purchase(addr: address, prm: uint256) -> bool:
    """
    @notice Buyer purchases ECO for Premium:wei, Seller can claim Premium, Buyer is authorized
    """
    return self.slate.purchase(addr, prm)

    #if(msg.sender == self.buyer):
    #    self.isAuthed[self.buyer] = True
    #    self.claimedBalance[self.seller] = msg.value
    #    log.Cashflow(self.buyer, self, msg.value, True)
    #    log.Purchaser(self.buyer, self, msg.value, True)
    #    return self.isAuthed[self.buyer]
    #else:
    #    log.Error('Msg.sender != Buyer')
    #    return False

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
    if(msg.sender == self.buyer and self.jackpot >= self.strikepot):
        """
        This is where cash dispersement is handled
        ECO tx -> send buyer: current price * notional
        ECO tx -> send seller: strike * notional + margin
        ECO deactivated and completed
        """
        assert self.active
        log.Exercise(self.buyer, self, True)
        log.Cashflow(self.buyer, self, self.jackpot, True)
        send(self.buyer, self.jackpot)
        log.Cashflow(self.seller, self, self.stub, True)
        send(self.seller, self.stub)
        self.active = False
        self.completed = True
        return True
    else:
        log.Error('Exercise attempt returns False')
        return False