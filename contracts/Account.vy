# @notice Accounts used to trading the ECO
# @author Alexander Angel

struct AuthTimePeriod:
    timeAmount: uint256
    startTime: uint256

Error: event({message: string[50]})

authorized: map(address, bool)
addresses: address
owner: address

@public
def _owner():
    self.owner = msg.sender

@public
def Account():
    pass

@public
def isAuthorized(accountAddress: address) -> bool:
    return self.authorized[accountAddress]

@public
def deposit() -> bool:
    if(msg.sender == self.owner or self.authorized[msg.sender]):
        return True
    else:
        log.Error('Deposit must be authorized')
        return False

@public
def withdraw(amount: uint256) -> bool:
    if(amount > self.balance):
        log.Error('Exceeds balance')
        return False
    if(msg.sender == self.owner or self.authorized[msg.sender]):
        send(msg.sender, amount)
        return True
    return False

@public
def authorize(accountAddress: address, timeAmount: uint256) -> bool:
    if(tx.origin != self.owner):
        log.Error('Authorization must be from owner')
        return False
    if(timeAmount == 0):
        log.Error('Authorization must have > 0 time amount')
        return False
    self.authorized[accountAddress] = True
    return True


    