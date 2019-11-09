# @notice Implementation of an American Call Option on the Ethereum Network
# @author Alexander Angel

contract Factory():
    def getEco(user_addr: address) -> address:constant
    def getUser(eco: address) -> address:constant
    def getAccount(account: address) -> address:constant

contract Account():
    def deposit(vendor_addr: address) -> bool: modifying
    def withdraw(vendor_addr: address, wad: wei_value) -> bool: modifying
    def authorize(accountAddress: address) -> bool: modifying

# @notice Events

Error: event({message: string[50]})
Initialized: event({user: indexed(address), eco: indexed(address), outcome: bool})
Authorization: event({user: indexed(address), eco: indexed(address), outcome: bool})
Validation: event({eco: indexed(address), vendee: indexed(address), vendor: indexed(address), outcome: bool})
Withdrawal: event({user: indexed(address), eco: indexed(address), amount: wei_value, outcome: bool})
Exercise: event({user: indexed(address), eco: indexed(address), outcome: bool})
Settlement: event({user: indexed(address), eco: indexed(address), amount: wei_value, outcome: bool})
Payment: event({amount: wei_value, source: indexed(address)})
Cashflow: event({user: indexed(address), eco: indexed(address), amount: wei_value, outcome: bool})


# @notice Variables
factory: Factory
user: address
buyer: address
vendee: Account
seller: address
vendor: Account
strike: wei_value
notional: uint256
maturity: timedelta
active: bool
completed: bool
isAuthed: map(address, bool)
owner: address

@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)

# @notice Initializer, Vendee is buyer's account address, Vendor is seller's account address
# @params buyer:address, seller:address, underlier:wei, strikePrice:wei, notional:uint256, maturity:timedelta
@public
def setup(  _buyer: address, 
            _vendee: address,
            _seller: address,
            _vendor: address,
            _strike: wei_value,
            _notional: uint256,
            _maturity: timedelta
            ):
    assert(self.factory == ZERO_ADDRESS and self.user == ZERO_ADDRESS) and msg.sender != ZERO_ADDRESS
    self.factory = Factory(msg.sender)
    self.buyer = _buyer
    self.vendee = Account(_vendee)
    self.seller = _seller
    self.vendor = Account(_vendor)
    self.strike = _strike
    self.notional = _notional
    self.maturity = _maturity
    self.active = False
    self.completed = False
    self.owner = msg.sender

@public
def authorizeAccounts() -> bool:
    auth_ee: bool = True
    auth_or: bool = True
    if(msg.sender == self.buyer):
        auth_ee = self.vendee.authorize(self.vendee)
        log.Authorization(self.vendee, self, True)
    if(msg.sender == self.seller):
        auth_or = self.vendor.authorize(self.vendor)
        log.Authorization(self.vendor, self, True)
    self.isAuthed[self.vendee] = auth_ee
    self.isAuthed[self.vendor] = auth_or
    return auth_ee and auth_or

@public
def validate() -> bool:
    if(self.active or self.completed):
        log.Error('Should be Inactive')
        return True
    
    if(not self.isAuthed[self.vendee]):
        log.Error('Need Authorized buyer')
        return False
    
    if(not self.isAuthed[self.vendor]):
        log.Error('Need Authorized seller')
        return False

    self.active = True
    log.Validation(self, self.vendee, self.vendor, True)
    return True

@private
def check(source: address) -> bool:
    if(self.vendor == source):
        return True
    else:
        return False

@public
@payable
def settle() -> bool:
    """
    Disperses cash flows and deactivates contract. 
    Returns True if successful
    """
    if(not self.check(msg.sender)):
        return False
    # Withdraw any balance leftover
    if(self.balance > 0):
        log.Cashflow(self.owner, self, self.balance, True)
        send(self.owner, self.balance)
    return True

@public
@payable
def exercise() -> bool:
    if(msg.sender == self.seller):
        log.Error('Exercise Call must be from Buyer')
        return False
    if(msg.sender == self.buyer):
        """
        This is where cash dispersement is handled.
        ECO tx -> Vendor: withdraw(strike amount)
        ECO tx -> Vendee: deposit(strike amount)
        ECO tx -> Vendee: withdraw(spot amount)
        ECO tx -> Vendor: deposit(spot amount)
        ECO deactivated and completed
        return True
        """
        val: wei_value = 1*10**18
        log.Exercise(self.buyer, self, True)
        self.vendor.withdraw(self.vendor, val)


        return True
    else:
        log.Error('Exercise attempt returns False')
        return False