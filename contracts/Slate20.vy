# @title SLATE 
# 
# @notice Buyer and Writer Registry and Authentication
# 
# @author Alexander Angel
# 
# @dev SStore of users

contract Stash20():
    def getAddress(addr: address) -> bool:modifying
    def deposit(writer: address, margin: uint256) -> bool:modifying
    

Buy: event({buyer: indexed(address), prm: uint256})
Write: event({writer: indexed(address)})
Deposit: event({source: indexed(address), val: wei_value})

# Contract Interface variables
stash20: Stash20

# User Variables

# FIX
# buyer: public(address) 
# writer: public(address)

option: public(address)
wrote: public(map(address, address)) # option addr, writer addr
bought: public(map(address, address)) # option addr, buyer addr
premium: public(map(address, uint256)) # premium paid for option

@public
@payable
def __default__():
    log.Deposit(msg.sender, msg.value)

@public
def __init__(_stash20: address, _option: address):
    self.stash20 = Stash20(_stash20)
    self.premium[ZERO_ADDRESS] = 0
    self.stash20.getAddress(self) # Sends the Slate and Option address to stash20
    # FIX
    self.option = _option

@public
@payable
def write(_option: address, prm: uint256, margin: uint256) -> bool:
    """
    @notice Seller writes ECO Contract, Deposits margin, Seller is authorized
    """
    self.wrote[_option] = tx.origin
    self.stash20.deposit(tx.origin, margin)
    log.Write(tx.origin)

    # call external margin depost function
    return True

@public
@payable
def purchase(_option: address, prm: uint256) -> bool:
    """
    @notice Buyer purchases ECO for Premium:wei, Seller can claim Premium, Buyer is authorized
    """

    self.bought[_option] = tx.origin # sets option to a buyer -> 20k gas
    self.premium[tx.origin] = prm # sets buyer's deposit to premium, for writer to withdraw -> 20k gas
    log.Buy(tx.origin, prm) # -> 1.4k gas
    # Going to need cond to check if writer purchased to closed, or make that seperate
    #if(tx.origin == self.writer):
    #    return False

    # FIX
    assert not tx.origin == self.option

    return True

@public
def withdraw(val: uint256) -> bool:
    send(self.wrote[msg.sender], as_wei_value(val, 'ether'))
    return True