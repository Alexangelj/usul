# @title STASH 
# 
# @notice Margin Record Store and Deposit Authentication
# 
# @author Alexander Angel
# 
# @dev SStore of margin deposits

contract Slate():
    def wrote(_writer: address) -> address:constant

Fund: event({writer: indexed(address), margin: uint256})
Melt: event({writer: indexed(address)})
Deposit: event({source: indexed(address), val: wei_value})

writer: public(address)
fund: public(map(address, uint256))
slate: Slate

@public
@payable
def __default__():
    log.Deposit(msg.sender, msg.value)

@public
def getAddress(addr: address) -> bool:
    self.slate = Slate(addr)
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
    send(self.slate.wrote(msg.sender), as_wei_value(val-1, 'ether')) # fix -1 to become the underlying - strike difference
    send(tx.origin, as_wei_value(1, 'ether')) # Price * notional payment to buyer (tx.origin)
    return True
