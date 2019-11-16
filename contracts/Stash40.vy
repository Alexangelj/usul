# @title STASH 
# 
# @notice Underlying Record Store and Deposit Authentication for underwritten assets
# 
# @author Alexander Angel
# 
# @dev SStore of margin deposits


contract Slate40():
    def wrote(_writer: address) -> address:constant

contract Token():
    def name() -> string[64]:constant
    def symbol() -> string[32]:constant
    def decimals() -> uint256: constant
    def totalSupply() -> uint256:constant
    def balanceOf(_owner: address) -> uint256:constant
    def allowance(_owner: address, _spender: address) -> uint256:constant
    def transfer(_to: address, _value: uint256) -> bool:modifying
    def transferFrom(_from: address, _to: address, _value: uint256) -> bool:modifying
    def approve(_spender: address, _value: uint256) -> bool:modifying

Fund: event({writer: indexed(address), margin: uint256})
Melt: event({writer: indexed(address)})
Deposit: event({source: indexed(address), val: wei_value})
Transfer: event({_from: indexed(address), _to: indexed(address), _value: uint256})
Approval: event({_owner: indexed(address), _spender: indexed(address), _value: uint256})

writer: public(address)
wrote: public(map(address, address)) # option addr, writer addr
fund: public(map(address, uint256)) # address to margin bals in uint256
slate40: public(Slate40)
token: public(Token)

@public
@payable
def __default__():
    log.Deposit(msg.sender, msg.value)

@public
def __init__(token_address: address):
    self.token = Token(token_address)

@public
def getAddress(addr: address) -> bool:
    self.slate40 = Slate40(addr)
    return True

@public
@payable
def write(_option: address, _underlying: uint256) -> bool:
    """
    @notice Seller writes ECO Contract, Deposits _underlying, Seller is authorized
    """
    self.wrote[_option] = tx.origin
    self.fund[tx.origin] = _underlying
    log.Fund(tx.origin, _underlying)
    # call external margin depost function
    return True

@public
def deposit(addr: address, margin: uint256) -> bool:
    """
    @notice - Maps writer's address to margin.
    """
    self.fund[addr] = margin
    log.Fund(addr, margin)
    return True

@public
def withdraw(val: uint256) -> bool:
    # FIX, seller gets the purchase price of strike * notional for the tokens deposited.
    #self.token.transfer(self.slate40.wrote(msg.sender), val-1) # FIX Send remaining margin to writer fix -1 to become the underlying - strike difference
    self.token.transfer(tx.origin, val) # Price * notional payment to buyer (tx.origin)
    return True

@public
def withdrawPut(addr: address, val: uint256) -> bool:
    # FIX, seller gets the purchase price of strike * notional for the tokens deposited.
    #self.token.transfer(self.slate40.wrote(msg.sender), val-1) # FIX Send remaining margin to writer fix -1 to become the underlying - strike difference
    self.token.transfer(addr, val) # Price * notional payment to writer (addr)
    return True
