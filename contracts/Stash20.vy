# @title STASH 
# 
# @notice Margin Record Store and Deposit Authentication
# 
# @author Alexander Angel
# 
# @dev SStore of margin deposits


contract Slate20():
    def wrote(_writer: address) -> address:constant

contract Token():
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
fund: public(map(address, uint256)) # address to margin bals in uint256
slate20: public(Slate20)
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
    self.slate20 = Slate20(addr)
    return True

@public
def deposit(_writer: address, margin: uint256) -> bool:
    """
    @notice - Maps writer's address to margin.
    """
    self.fund[_writer] = margin
    log.Fund(_writer, margin)
    return True

@public
def withdraw(val: uint256) -> bool:
    # FIX, seller gets the purchase price of strike * notional for the tokens deposited.
    #self.token.transfer(self.slate20.wrote(msg.sender), val-1) # FIX Send remaining margin to writer fix -1 to become the underlying - strike difference
    self.token.transfer(tx.origin, val) # Price * notional payment to buyer (tx.origin)
    return True
