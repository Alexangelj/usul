# @title SLATE 
# 
# @notice Buyer and Writer Registry and Authentication
# 
# @author Alexander Angel
# 
# @dev SStore of users

contract Stash():
    def deposit(writer: address, margin: uint256) -> bool:modifying

Buy: event({buyer: indexed(address), prm: uint256})
Write: event({writer: indexed(address)})

# Contract Interface variables
stash: Stash

# User Variables

# FIX
# buyer: public(address) 
# writer: public(address)

option: public(address)
wrote: public(map(address, address)) # writer addr, option addr
bought: public(map(address, address)) # buyer addr, option addr
premium: public(map(address, uint256)) # premium paid for option

@public
def __init__(_stash: address, _option: address):
    self.stash = Stash(_stash)
    self.premium[ZERO_ADDRESS] = 0

    # FIX
    self.option = _option

@public
@payable
def write(_option: address, prm: uint256, margin: uint256) -> bool:
    """
    @notice Seller writes ECO Contract, Deposits margin, Seller is authorized
    """
    self.wrote[_option] = msg.sender
    self.stash.deposit(msg.sender, margin)
    log.Write(msg.sender)

    # call external margin depost function
    return True

@public
@payable
def purchase(_option: address, prm: uint256) -> bool:
    """
    @notice Buyer purchases ECO for Premium:wei, Seller can claim Premium, Buyer is authorized
    """

    self.bought[_option] = msg.sender # sets option to a buyer -> 20k gas
    self.premium[msg.sender] = prm # sets buyer's deposit to premium, for writer to withdraw -> 20k gas
    log.Buy(msg.sender, prm) # -> 1.4k gas
    # Going to need cond to check if writer purchased to closed, or make that seperate
    #if(msg.sender == self.writer):
    #    return False

    # FIX
    assert not msg.sender == self.option

    return True