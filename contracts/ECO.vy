# @notice Implementation of an American Call Option on the Ethereum Network
# @author Alexander Angel

contract Factory():
    def getEco(user_addr: address) -> address:constant
    def getUser(eco: address) -> address:constant
    def getAccount(account: address) -> address:constant

# @notice Events

Error: event({message: string[50]})
Initialized: event({user: indexed(address), eco: indexed(address), outcome: bool})
Authorization: event({user: indexed(address), eco: indexed(address), outcome: bool})
Withdrawal: event({user: indexed(address), eco: indexed(address), amount: wei_value, outcome: bool})
Exercise: event({user: indexed(address), eco: indexed(address), outcome: bool})
Settlement: event({user: indexed(address), eco: indexed(address), amount: wei_value, outcome: bool})
Payment: event({amount: wei_value, source: indexed(address)})


# @notice Variables
factory: Factory
user: address
buyer: address
vendee: address
seller: address
vendor: address
strike: wei_value
notional: wei_value
maturity: timedelta

# @notice Initializer, Vendee is buyer's account address, Vendor is seller's account address
# @params buyer:address, seller:address, underlier:wei, strikePrice:wei, notional:wei, maturity:timedelta
@public
def setup(  _buyer: address, 
            _vendee: address,
            _seller: address,
            _vendor: address,
            _strike: wei_value,
            _notional: wei_value,
            _maturity: timedelta
            ):
    assert(self.factory == ZERO_ADDRESS and self.user == ZERO_ADDRESS) and msg.sender != ZERO_ADDRESS
    self.factory = Factory(msg.sender)
    self.buyer = _buyer
    self.vendee = _vendee
    self.seller = _seller
    self.vendor = _vendor
    self.strike = _strike
    self.notional = _notional
    self.maturity = _maturity

@public
def authorizeAccounts() -> bool:
    if(msg.sender == self.buyer):
        log.Authorization(msg.sender, self, True)
        return True
    else:
        return False