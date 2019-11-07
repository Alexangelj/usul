# @notice Implementation of an American Call Option on the Ethereum Network
# @author Alexander Angel

contract Account():
    def deposit() -> bool: modifying
    def withdraw() -> bool: modifying
    def authorize(accountAddress: address, timeAmount: uint256) -> bool: modifying
    def isAuthorized(accountAddress: address) -> bool: constant
    def _owner(): constant

# @notice Events

Authorization: event({owner: indexed(address), outcome: bool})
Validation: event({owner: indexed(address), outcome: bool})
Withdrawal: event({owner: indexed(address), outcome: bool})
Exercise: event({owner: indexed(address), outcome: bool})
Settlement: event({source: indexed(address), to: indexed(address), amount: wei_value})

Error: event({message: string[50]})

# @notice Variables

# Owner
owner: address

# Contract
active: bool
completed: bool
account: Account

# Users and Accounts
buyer: address
seller: address
_buyerAccount: Account
_sellerAccount: Account

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
def __init__(
    buyerAccount: address, 
    sellerAccount: address,
    _strikePrice: uint256,
    _notional: uint256,
    _maturity: timedelta,
    ):

    # Set up accounts
    self._buyerAccount = Account(buyerAccount)
    self.buyer = self._buyerAccount.msg.sender
    self._sellerAccount = Account(sellerAccount)
    self.seller = self._sellerAccount.msg.sender

    self.strikePrice = _strikePrice
    self.notional = _notional
    self.timeToExpiry = _maturity
    self.startTime = block.timestamp

    self.active = False
    self.completed = False

# @notice Utility Functions

@private
def inTheMoney() -> bool:
    value: wei_value = self.strikePrice - self.underlyingPrice
    if(value > 0):
        return True
    else:
        return False
@public
def initiatedFrom(source: address) -> bool:
    return msg.sender == source


# @notice Authorize Accounts

@public
def authorizeAccount() -> bool:
    # buyer authorized variable
    vendee: bool = True
    # seller authorized variable
    vendor: bool = True
    if(initiatedFrom(self.buyer)):
        vendee = buyerAccount.authorize(self)
        log.Authorization(msg.sender, vendee)
    if(initiatedFrom(self.seller)):
        vendor = sellerAccount.authorize(self)
        log.Authorization(msg.sender, vendor)
    return vendee and vendor


# @notice Validate the Emerald Call Option
@public
def validate() -> bool:
    if(active or completed):
        log.Error('Must be inactive')
        return True
    
    # Authorize counterparty
    authorizeAccount()
    # Check for Authorized Accounts
    if(not buyerAccount.isAuthorized(this)):
        log.Error('Need authorized buyer')
        return False
    if(not sellerAccount.isAuthorized(this)):
        log.Error('Need authorized seller')
        return False
    active = True
    log.Validate(address(this), active)


# @notice Buyer Exercises the Contract
@public
def exercise() -> bool:
    if(not initiatedFrom(buyer)):
        log.Error('Must be buyer')
        return False
    
    if(not inTheMoney):
        log.Error('Must be ITM')
        return False
    if(this.balance > 0):
        log.Settlement(address(this), owner, this.balance)
        owner.send(this.balance)

        

# @notice Cash Settled to Accounts


