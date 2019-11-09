# @notice Accounts created mint tokens at a 1:1 ratio to ether which are then authorized to trade the option
# @author Alexander

contract Factory():
    def getAccount(user_addr: address) -> address:constant
    def getUser(userAcc: address) -> address:constant

Error: event({message: string[50]})
AccountCreated: event({user: indexed(address), userAcc: indexed(address), outcome: bool})
AccountAuthorized: event({user: indexed(address), userAcc: indexed(address), outcome: bool})
AccountDeposit: event({user: indexed(address), userAcc: indexed(address), amount: wei_value, outcome: bool})
AccountWithdrawal: event({user: indexed(address), userAcc: indexed(address), amount: wei_value, outcome: bool})

accounts: map(address, address)
authorized: public(map(address, bool))
factory: Factory
owner: public(address)
user: address


@public
def setup(user_addr: address):
    assert(self.factory == ZERO_ADDRESS and self.user == ZERO_ADDRESS) and user_addr != ZERO_ADDRESS
    self.factory = Factory(msg.sender)
    self.user = user_addr
    self.owner = user_addr
    log.AccountCreated(user_addr, self, True)

@public
def authorize(userAcc: address) -> bool:
    self.authorized[userAcc] = True
    log.AccountAuthorized(self.factory, userAcc, True)
    return True

@public
@payable
def deposit( addr: address) -> bool:
    if(self.authorized[addr]):
        log.AccountDeposit(msg.sender, addr, msg.value, True)
        return True
    else:
        log.Error('Deposit must be authorized')
        return False

@public
def withdraw(addr: address, amount: wei_value) -> bool:
    if(amount > self.balance):
        log.Error('Exceeds balance')
        return False
    if(self.authorized[addr]):
        log.AccountWithdrawal(msg.sender, addr, amount, True)
        log.Error('Authorized, continue to withdraw')
        send(msg.sender, 1)
        return True
    log.Error('Withdraw Unsuccessful, User Unauthorized')
    return False


@public
@constant
def userAddress() -> address:
    return self.user

@public
@constant
def factoryAddress() -> address:
    return self.factory

@public
@constant 
def ownerAddress() -> address:
    return self.owner

@public
@constant
def authorizedAccount(userAcc_addr: address) -> bool:
    return self.authorized[userAcc_addr]
 
@public
@constant
def accountBalance() -> wei_value:
    return self.balance

    