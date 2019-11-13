# @title A Recieving Call - Physically Settled via an ERC-20 Token
# 
# @notice Implementation of an American Call Option on the Ethereum Network
# 
# @author Alexander Angel
# 
# @dev Uses a factory to initialize and deploy option contracts
contract Factory():
    def getEco(user_addr: address) -> address:constant
    def getUser(eco: address) -> address:constant

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

factory: Factory

# New
slate: public(Slate)
stash: public(Stash)
wax: public(Wax)
dai: public(Dai)


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
    self.dai = Dai(_token_address)

@public
def isMature() -> bool:
    """
    @notice ECOs have a time to expiration, this checks if it has expired
    """
    return self.wax.timeToExpiry(self.expiration)

@public
@payable
def purchase(_option: address, prm: uint256) -> bool:
    """
    @notice Buyer purchases ECO for Premium:wei, Seller can claim Premium, Buyer is authorized
    """
    send(self.slate, msg.value)
    log.Buy(self)
    return self.slate.purchase(_option, prm)

@public
@payable
def write(_option: address, prm: uint256, _margin: uint256) -> bool:
    """
    @notice Seller writes ECO Contract, Deposits margin, Seller is authorized
    """
    self.dai.transfer(self.stash, _margin)
    log.Write(self)
    return self.slate.write(_option, prm, _margin)


@public
def validate() -> bool:
    """
    @notice Checks if inactive, Checks Buyer & Seller's Authorization, Sends Premium to Seller, Activates Contract
    """
    assert not self.active, 'Should be inactive'
    assert not self.completed, 'Shouldnt be completed'
    log.Error(self.stash.fund(self.seller), self.margin)
    assert self.stash.fund(self.seller) >= self.margin
    assert self.slate.bought(self) == self.buyer
    assert self.slate.premium(self.buyer) >= 1 # fix the '1' with premium

    self.slate.withdraw(1)
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
    assert not msg.sender == self.seller
    assert msg.sender == self.buyer
    assert self.jackpot >= self.strikepot

    #self.slate.withdraw(1) # this val is jackpot
    self.stash.withdraw(3000000000000000000) # this val is stub, should be in DAI

    self.active = False
    self.completed = True
    log.Exercise(self)
    return True
