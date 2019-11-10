contract Account():
    def setup(user_addr: address): modifying

NewAccount: event({user: indexed(address), userAcc: indexed(address)})
Error: event({message: string[50]})
Payment: event({amount: wei_value, _from: indexed(address)})

userAccTemplate: public(address)
user_to_account: map(address, address)
account_to_user: map(address, address)


@public
def __init__(template: address):
    assert self.userAccTemplate == ZERO_ADDRESS
    assert template != ZERO_ADDRESS
    self.userAccTemplate = template

@public
def createAccount(user: address) -> address:
    assert user != ZERO_ADDRESS
    assert self.userAccTemplate != ZERO_ADDRESS
    assert self.user_to_account[user] == ZERO_ADDRESS
    userAcc: address = create_forwarder_to(self.userAccTemplate)
    Account(userAcc).setup(user)
    self.user_to_account[user] = userAcc
    self.account_to_user[userAcc] = user
    log.NewAccount(user, userAcc)
    return userAcc

@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)

@public
@constant
def getAccount(user: address) -> address:
    return self.user_to_account[user]

@public
@constant
def getUser(userAcc: address) -> address:
    return self.account_to_user[userAcc]