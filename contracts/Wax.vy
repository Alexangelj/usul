# @title WAX 
# 
# @notice Time Expiration Record and Maturity Condition Validation
# 
# @author Alexander Angel
# 
# @dev SStore of time

Waxing: event({eco: indexed(address)})
Waning: event({eco: indexed(address)})

expiration: public(map(address, timestamp)) # maps ECOs to timestamp of their expiration

@public
def timeToExpiry(time: timestamp) -> bool:
    self.expiration[msg.sender] = time
    if(time - block.timestamp >= 0):
        log.Waning(msg.sender)
        return True
    else:
        log.Waxing(msg.sender)
        return False
