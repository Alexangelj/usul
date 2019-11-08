# @notice Implementation of an American Call Option on the Ethereum Network
# @author Alexander Angel

contract Account():
    def deposit(amount: wei_value) -> bool: modifying
    def withdraw(amount: wei_value) -> bool: modifying
    def authorize(accountAddress: address) -> bool: modifying
    def isAuthorized(accountAddress: address) -> bool: constant
    def _owner() -> address: modifying
    def accountAddresses() -> address: modifying

# @notice Events

Initialized: event({owner: indexed(address), strike: wei_value})
Authorization: event({owner: indexed(address), outcome: bool})
Validation: event({owner: indexed(address), outcome: bool})
Withdrawal: event({owner: indexed(address), outcome: bool})
Exercise: event({owner: indexed(address), outcome: bool})
Settlement: event({source: indexed(address), to: indexed(address), amount: wei_value})

Payment: event({amount: wei_value, source: indexed(address)})
Error: event({message: string[50]})

# @notice Variables

# Owner
owner: address

# Contract
active: bool
completed: bool
account: Account
deposit: wei_value

# Users and Accounts
buyer: address
seller: address
_buyerAccount: Account
_sellerAccount: Account
# buyer authorized variable
vendee: bool
# seller authorized variable
vendor: bool

# Underlying Asset Details
underlyingPrice: wei_value
strikePrice: wei_value
notional: wei_value
underlying: address

# Exercise Conditions
timeToExpiry: timedelta
startTime: timestamp


@public
def _owner():
    self.owner = msg.sender


# @notice Initializer
# @params buyer:address, seller:address, underlier:wei, strikePrice:wei, notional:wei, maturity:timedelta

@public
@payable
def __init__(
    buyerAccount: address, 
    sellerAccount: address,
    _strikePrice: wei_value,
    _notional: wei_value,
    _maturity: timedelta,
    _deposit: wei_value
    ):

    # Set up accounts
    self._buyerAccount = Account(buyerAccount)
    self.buyer = self._buyerAccount.accountAddresses()
    self._sellerAccount = Account(sellerAccount)
    self.seller = self._sellerAccount.msg.sender

    self.strikePrice = _strikePrice
    self.notional = _notional
    self.timeToExpiry = _maturity
    self.startTime = block.timestamp
    self.underlyingPrice = 10

    self.active = False
    self.completed = False

    self.vendee = False
    self.vendor = False

    self.deposit = _deposit
    #send(self, self.deposit)

    log.Initialized(msg.sender, self.strikePrice)
# @notice Utility Functions

@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)


@public
@constant
def strike() -> wei_value:
    return self.strikePrice

@public
@constant
def notionalValue() -> wei_value:
    return self.notional

@public
@constant
def _buyer() -> address:
    return self.buyer

@public
@constant
def buyerAcc() -> address:
    return self._buyerAccount

@public
@constant
def _seller() -> address:
    return self.seller

@public
@constant
def sellerAcc() -> address:
    return self._sellerAccount

@public
def inTheMoney() -> bool:
    value: wei_value = self.underlyingPrice - self.strikePrice
    if(value >= 0):
        return True
    else:
        return False

@public
def initiatedFrom(source: address) -> bool:
    return msg.sender == source


# @notice Authorize Accounts

@public
def authorizeAccount() -> bool:
    self.vendee = True
    self.vendor = True

    # vendee = self._buyerAccount.authorize(self)
    log.Authorization(msg.sender, self.vendee)
    # vendor = self._sellerAccount.authorize(self)
    log.Authorization(msg.sender, self.vendor)

    return self.vendee and self.vendor


# @notice Validate the Emerald Call Option
@public
def validate() -> bool:
    if(self.active or self.completed):
        log.Error('Must be inactive')
        return True
    
    # Authorize counterparty


    # Check for Authorized Accounts
    if(not self.vendee):
        log.Error('Need authorized buyer')
        return False
    if(not self.vendor):
        log.Error('Need authorized seller')
        return False
    self.active = True
    log.Validation(self, self.active)
    return True


# @notice Buyer Exercises the Contract
@public
def exercise() -> bool:
    if(not msg.sender == self.buyer):
        log.Error('Must be buyer')
        return False
    
    if(not self.underlyingPrice - self.strikePrice >= 0):
        log.Error('Must be ITM')
        return False
    if(self.balance > 0):
        log.Settlement(self, self.owner, self.balance)
        send(self.owner, self.balance)

    #self._buyerAccount.deposit(self.strikePrice)
    #self._sellerAccount.deposit(self.underlyingPrice)
    
    #send(self._buyerAccount, self.underlyingPrice)
    #send(self._sellerAccount, self.strikePrice)
    ## self._buyerAccount.withdraw(as_wei_value(1, 'wei'))
    ## log.Settlement(self._buyerAccount, self._sellerAccount, self.balance)
    ## self._sellerAccount.deposit()
## 
    ## self._sellerAccount.withdraw(as_wei_value(1, 'wei'))
    ## log.Settlement(self._sellerAccount, self._buyerAccount, self.balance)
    ## self._buyerAccount.deposit()   

    self.active = False
    self.completed = True

    log.Exercise(self, self.completed)

    return True

        

# @notice Cash Settled to Accounts


