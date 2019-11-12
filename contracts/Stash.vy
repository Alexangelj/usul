# @title STASH 
# 
# @notice Margin Record Store and Deposit Authentication
# 
# @author Alexander Angel
# 
# @dev SStore of margin deposits

Fund: event({writer: indexed(address), margin: uint256})
Melt: event({writer: indexed(address)})

writer: public(address)
fund: public(map(address, uint256))

@public
def deposit(_writer: address, margin: uint256) -> bool:
    """
    @notice - Maps writer's address to margin.
    """
    self.fund[_writer] = margin
    log.Fund(_writer, margin)
    return True