# @notice Implementation of an American Call Option on the Ethereum Network
# @author Alexander Angel


# @notice Events

Authorization: event({owner: indexed(address), outcome: bool})
Validation: event({owner: indexed(address), outcome: bool})
Withdrawal: event({owner: indexed(address), outcome: bool})
Exercise: event({owner: indexed(address), outcome: bool})
Settlement: event({source: indexed(address), to: indexed(address), amount: wei_value})

Error: event({message: string[50]})

# @notice Variables

# Owner
_owner: address

# Contract
active: bool
completed: bool

# Users and Accounts
buyer: address
seller: address
buyerAccount: address
sellerAccount: address

# Underlying Asset Details
underlyingPrice: wei_value
strikePrice: wei_value
notional: wei_value
underlying: address

# Exercise Conditions
timeToExpiry: timedelta
startTime: timestamp


@private
def ECO() {
    active = False
    completed = False
}

@private
def _owner():
    _owner = msg.sender


# @notice Initializer
# @params buyer:address, seller:address, underlier:wei, strikePrice:wei, notional:wei, maturity:timedelta

@public
def __init__(
    buyerAccount: address, 
    sellerAccount: address, 
    underlier: wei_value, 
    strikePrice: wei_value, 
    notional: wei_value, 
    maturity: timedelta
    ):

    # Set up accounts
    buyerAccount =
    buyer = buyerAccount
    sellerAccount =
    seller = sellerAccount._owner()

    self.strikePrice = strikePrice
    self.notional = notional
    self.timeToExpiry = maturity
    self.startTime = block.timestamp

    # Authorize account of caller
    authorizeAccount()


# @notice Authorize Accounts

@public
def authorizeAccount() -> bool:
    # buyer authorized variable
    vendee: bool = True
    # seller authorized variable
    vendor: bool = True
    if(initiatedFrom(buyer)):
        vendee = buyerAccount.authorize(this)
        log.Authorization(msg.sender, vendee)
    if(initiatedFrom(seller)):
        vendor = sellerAccount.authorize(this)
        log.Authorization(msg.sender, vendor)
    return vendee & vendor


# @notice Validate the Emerald Call Option
@public
def validate() -> bool:
    if(active OR completed):
        log.Error('Must be inactive')
        return True
    
    # Authorize counterparty
    authorizeAccount()
    # Check for Authorized Accounts
    if(!buyerAccount.isAuthorized(this) OR !sellerAccount.isAuthorized(this)):
        log.Error('Need authorized accounts')
        return False
    active = True
    log.Validate(address(this), active)


# @notice Buyer Exercises the Contract
@public
def exercise() -> bool:
    if(!initiatedFrom(buyer)):
        log.Error('Must be buyer')
        return False
    
    if(!inTheMoney):
        log.Error('Must be ITM')
        return False
    if(this.balance > 0):
        log.Settlement(address(this), _owner, this.balance)
        _owner.send(this.balance)

        

# @notice Cash Settled to Accounts


# @notice Utility Functions

@private
def inTheMoney() -> bool:
    value: wei_value = strikePrice - underlyingPrice
    if(value > 0):
        return True
    else:
        return False
@private
def initiatedFrom(source: address) -> bool:
    return msg.sender == source