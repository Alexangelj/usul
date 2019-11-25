# @title Factory
# 
# @notice Controls creation of
# 
# @author Alexander Angel
# 
# @dev Instrument Controller manages this contract
#
# @version 0.1.0b14

struct Set:
    expiration: timestamp[4]

name: public(string[64])
set: map(string[64], Set)

MONTH_IN_SECONDS: constant(uint256) = 604800

@public
def __init__():
    self.name = 'Factory'
    self.set['1'] = Set({expiration: [1577678400, 1577678400 + MONTH_IN_SECONDS, 1577678400 + MONTH_IN_SECONDS * 2, 1577678400 + MONTH_IN_SECONDS * 3]})


@public
def createSet(_symbol: string[64], _epoch: timestamp, _cycle: uint256) -> timestamp[4]:
    self.set[_symbol] = Set({expiration: [
        _epoch, 
        _epoch + _cycle, 
        _epoch + _cycle * 2, 
        _epoch + _cycle * 3
    ]})
    return self.set[_symbol].expiration