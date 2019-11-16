# @title SLATE 
# 
# @notice Buyer, Writer, and Premium/Capital Registry and Authentication for Strike Assets (tokens)
# 
# @author Alexander Angel
# 
# @dev SStore of users

contract Stash40():
    def getAddress(addr: address) -> bool:modifying
    def deposit(writer: address, margin: uint256) -> bool:modifying

contract Token():
    def totalSupply() -> uint256:constant
    def balanceOf(_owner: address) -> uint256:constant
    def allowance(_owner: address, _spender: address) -> uint256:constant
    def transfer(_to: address, _value: uint256) -> bool:modifying
    def transferFrom(_from: address, _to: address, _value: uint256) -> bool:modifying
    def approve(_spender: address, _value: uint256) -> bool:modifying

Buy: event({buyer: indexed(address), prm: uint256})
Write: event({writer: indexed(address)})
Deposit: event({source: indexed(address), val: wei_value})

# Contract Interface variables
stash40: Stash40

# User Variables

option: public(address)
wrote: public(map(address, address)) # option addr, writer addr
bought: public(map(address, address)) # option addr, buyer addr
premium: public(map(address, uint256)) # premium paid for option
token: public(Token)

@public
@payable
def __default__():
    log.Deposit(msg.sender, msg.value)

@public
def __init__(_stash40: address, _option: address, _token: address):
    self.stash40 = Stash40(_stash40)
    self.premium[ZERO_ADDRESS] = 0
    self.stash40.getAddress(self) # Sends the Slate and Option address to stash40
    # FIX
    self.option = _option
    self.token = Token(_token)

@public
@payable
def write(_option: address, prm: uint256, margin: uint256) -> bool:
    """
    @notice Seller writes ECO Contract, Deposits margin, Seller is authorized
    """
    self.wrote[_option] = tx.origin
    self.stash40.deposit(tx.origin, margin)
    log.Write(tx.origin)

    # call external margin depost function
    return True

@public
@payable
def purchase(_option: address, prm: uint256) -> bool:
    """
    @notice Buyer purchases ECO for Premium:wei, Seller can claim Premium, Buyer is authorized
    """

    self.bought[_option] = tx.origin # sets option to a buyer -> 40k gas
    self.premium[tx.origin] = prm # sets buyer's deposit to premium, for writer to withdraw -> 40k gas
    log.Buy(tx.origin, prm) # -> 1.4k gas
    # Going to need cond to check if writer purchased to closed, or make that seperate
    #if(tx.origin == self.writer):
    #    return False

    # FIX
    assert not tx.origin == self.option

    return True

@public
@payable
def writePut(_option: address, prm: uint256, margin: uint256) -> bool:
    """
    @notice Seller writes ECO Contract, Deposits margin, Seller is authorized
    """
    self.wrote[_option] = tx.origin # Record the writer
    self.premium[tx.origin] += margin
    log.Write(tx.origin)

    # call external margin depost function
    return True

@public
@payable
def purchasePut(_option: address, prm: uint256, margin: uint256) -> bool:
    """
    @notice Buyer purchases ECO for Premium:wei, Seller can claim Premium, Buyer is authorized
    """

    self.bought[_option] = tx.origin # sets option to a buyer -> 40k gas
    self.premium[tx.origin] += prm # sets buyer's deposit to premium, for writer to withdraw -> 40k gas
    self.stash40.deposit(tx.origin, margin)
    log.Buy(tx.origin, prm) # -> 1.4k gas
    # Going to need cond to check if writer purchased to closed, or make that seperate
    #if(tx.origin == self.writer):
    #    return False

    # FIX
    assert not tx.origin == self.option

    return True

@public
def withdraw(val: wei_value) -> bool:
    send(self.wrote[msg.sender], val)
    return True

@public
def withdrawPut(val: wei_value) -> bool:
    send(self.bought[msg.sender], val)
    return True