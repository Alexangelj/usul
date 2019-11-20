# @title A Right to Put - Physically Settled ERC 20 Token
# 
# @notice Implementation of a Tokenized American Put Option on the Ethereum Network - Solo contract
# 
# @author Alexander Angel
# 
# @dev Uses a factory to initialize and deploy option contracts
#
# @version 0.1.0b14

from vyper.interfaces import ERC20
implements: ERC20


# Structs
struct Account:
    user: address
    strike_amount: uint256


struct LockBook:
    locks: map(uint256, Account)
    lock_key: uint256
    lock_length: uint256
    highest_lock: uint256


# Interfaces
contract Factory():
    def getContract(user_addr: address) -> address:constant
    def getUser(omn: address) -> address:constant


contract StrikeAsset(): # Strike price denominated in strike asset
    def totalSupply() -> uint256:constant
    def balanceOf(_owner: address) -> uint256:constant
    def allowance(_owner: address, _spender: address) -> uint256:constant
    def transfer(_to: address, _value: uint256) -> bool:modifying
    def transferFrom(_from: address, _to: address, _value: uint256) -> bool:modifying
    def approve(_spender: address, _value: uint256) -> bool:modifying


contract UnderlyingAsset():
    def totalSupply() -> uint256:constant
    def balanceOf(_owner: address) -> uint256:constant
    def allowance(_owner: address, _spender: address) -> uint256:constant
    def transfer(_to: address, _value: uint256) -> bool:modifying
    def transferFrom(_from: address, _to: address, _value: uint256) -> bool:modifying
    def approve(_spender: address, _value: uint256) -> bool:modifying


contract Wax():
    def timeToExpiry(time: timestamp) -> bool:constant


# Events
Write: event({_from: indexed(address), amount: uint256, key: uint256})
Exercise: event({_from: indexed(address), amount: uint256, key: uint256})
Close: event({_from: indexed(address), amount: uint256, key: uint256})
Mature: event({contract_addr: indexed(address)})
Payment: event({amount: wei_value, source: indexed(address)})
# EIP-20 Events
Transfer: event({_from: indexed(address), _to: indexed(address), _value: uint256})
Approval: event({_owner: indexed(address), _spender: indexed(address), _value: uint256})


# Interface Contracts
factory: public(Factory)
strikeAsset: public(StrikeAsset)
underlyingAsset: public(UnderlyingAsset)
wax: public(Wax)


# Probably can delete
owner: address


# Contract parameters
strike: public(uint256)
underlying: public(uint256)
maturity: public(timestamp)
premium: public(uint256)
expired: public(bool)


# EIP-20
name: public(string[64])
symbol: public(string[32])
decimals: public(uint256)
balanceOf: public(map(address, uint256))
allowances: map(address, map(address, uint256))
total_supply: uint256
minter: address


# User Claims
lockBook: public(LockBook)
highest_key: uint256
user_to_key: public(map(address, uint256))


# Constants
MAX_KEY_LENGTH: constant(uint256) = 2**10-1


@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)


@public
def setup(  _strike: uint256,
            _underlying: uint256,
            _maturity: timestamp,
            _wax_address: address,
            _strikeAsset_address: address,
            _underlyingAsset_address: address,
            ):
    """
    @notice - Setup is called from the factory contract using a contract template address
    """
    assert(self.factory == ZERO_ADDRESS and self.owner == ZERO_ADDRESS) and msg.sender != ZERO_ADDRESS
    self.factory = Factory(msg.sender)
    self.owner = tx.origin
    
    # Contract Parameters
    self.strike = _strike # Strike denominated in Strike Asset Amount -> 10 Dai
    self.underlying = _underlying # Underlying denominated in Underlying Asset Amount -> 2 Oat
    self.maturity = _maturity # Timestamp of maturity date

    # Interfaces
    self.strikeAsset = StrikeAsset(_strikeAsset_address)
    self.underlyingAsset = UnderlyingAsset(_underlyingAsset_address)
    self.wax = Wax(_wax_address)

    # EIP-20 Compliant Option Token
    self.name = "Dai Oat December"
    self.symbol = "DOZ"
    self.decimals = 10**18
    self.balanceOf[tx.origin] = 0
    self.total_supply = 0
    self.minter = tx.origin

    # Set first book account to admin
    self.lockBook.locks[0].user = tx.origin
    log.Transfer(ZERO_ADDRESS, tx.origin, 0)


# EIP-20 Functions - Source: https://github.com/ethereum/vyper/blob/master/examples/tokens/ERC20.vy
@public
@constant
def totalSupply() -> uint256:
    """
    @dev Total number of tokens in existence.
    """
    return self.total_supply

@public
@constant
def allowance(_owner : address, _spender : address) -> uint256:
    """
    @dev Function to check the amount of tokens that an owner allowed to a spender.
    @param _owner The address which owns the funds.
    @param _spender The address which will spend the funds.
    @return An uint256 specifying the amount of tokens still available for the spender.
    """
    return self.allowances[_owner][_spender]


@public
def transfer(_to : address, _value : uint256) -> bool:
    """
    @dev Transfer token for a specified address
    @param _to The address to transfer to.
    @param _value The amount to be transferred.
    """
    # NOTE: vyper does not allow underflows
    #       so the following subtraction would revert on insufficient balance
    self.balanceOf[msg.sender] -= _value
    self.balanceOf[_to] += _value
    log.Transfer(msg.sender, _to, _value)
    return True


@public
def transferFrom(_from : address, _to : address, _value : uint256) -> bool:
    """
     @dev Transfer tokens from one address to another.
          Note that while this function emits a Transfer event, this is not required as per the specification,
          and other compliant implementations may not emit the event.
     @param _from address The address which you want to send tokens from
     @param _to address The address which you want to transfer to
     @param _value uint256 the amount of tokens to be transferred
    """
    # NOTE: vyper does not allow underflows
    #       so the following subtraction would revert on insufficient balance
    self.balanceOf[_from] -= _value
    self.balanceOf[_to] += _value
    # NOTE: vyper does not allow underflows
    #      so the following subtraction would revert on insufficient allowance
    self.allowances[_from][msg.sender] -= _value
    log.Transfer(_from, _to, _value)
    return True


@public
def approve(_spender : address, _value : uint256) -> bool:
    """
    @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
         Beware that changing an allowance with this method brings the risk that someone may use both the old
         and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
         race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
         https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    @param _spender The address which will spend the funds.
    @param _value The amount of tokens to be spent.
    """
    self.allowances[msg.sender][_spender] = _value
    log.Approval(msg.sender, _spender, _value)
    return True


@private
def mint(_to: address, _value: uint256):
    """
    @dev Mint an amount of the token and assigns it to an account. 
         This encapsulates the modification of balances such that the
         proper events are emitted.
    @param _to The account that will receive the created tokens.
    @param _value The amount that will be created.
    """
    assert _to != ZERO_ADDRESS
    self.total_supply += _value
    self.balanceOf[_to] += _value
    log.Transfer(ZERO_ADDRESS, _to, _value)


@private
def _burn(_to: address, _value: uint256):
    """
    @dev Internal function that burns an amount of the token of a given
         account.
    @param _to The account whose tokens will be burned.
    @param _value The amount that will be burned.
    """
    assert _to != ZERO_ADDRESS
    self.total_supply -= _value
    self.balanceOf[_to] -= _value
    log.Transfer(_to, ZERO_ADDRESS, _value)


@public
def burn(_value: uint256):
    """
    @dev Burn an amount of the token of msg.sender.
    @param _value The amount that will be burned.
    """
    self._burn(msg.sender, _value)


@public
def burnFrom(_to: address, _value: uint256):
    """
    @dev Burn an amount of the token from a given account.
    @param _to The account whose tokens will be burned.
    @param _value The amount that will be burned.
    """
    self.allowances[_to][msg.sender] -= _value
    self._burn(_to, _value)


# Need to fix, constant function? Or modifying function? How do I liquidate mature contracts?
@public
def isMature() -> bool:
    """
    @notice - Checks to see if this Omn contract has expired.
    """
    self.expired = self.wax.timeToExpiry(self.maturity)
    return self.expired


@public
@payable
def write(underwritten_amount: uint256) -> bool:
    """
    @notice - Writer mints Omn tokens which represent underlying asset deposits.
    """
    lock_key: uint256 = 0 # Memory lock key number
    if(self.user_to_key[msg.sender] > 0): # if user has a key, use their key
        lock_key = self.user_to_key[msg.sender]
        self.lockBook.locks[lock_key].strike_amount += underwritten_amount
    else: # Else, increment key length, set a new Account
        lock_key = self.lockBook.lock_length + 1 # temporary lock key is length + 1
        self.lockBook.lock_length += 1 # Increment the lock key length
        self.user_to_key[msg.sender] = lock_key # Set user address to lock key
        self.lockBook.locks[lock_key] = Account({user: msg.sender, strike_amount: underwritten_amount})
    
    if(self.lockBook.locks[lock_key].strike_amount > self.lockBook.highest_lock): # If strike amount is highest, set
        self.lockBook.highest_lock = self.lockBook.locks[lock_key].strike_amount
        self.highest_key = lock_key
    
    token_amount: uint256 = underwritten_amount / self.strike * self.decimals # Example: self.strike = 2, so if I underwrite 12, I get 12 / 2 = 6 option tokens
    self.strikeAsset.transferFrom(msg.sender, self, underwritten_amount) # Store strike in contract
    self.mint(msg.sender, token_amount) # Mint amount of tokens equal to the strike deposited / strike asset amount
    log.Write(msg.sender, token_amount, lock_key)
    return True


@public
@payable
def close(option_amount: uint256) -> bool:
    """
    @notice - Writer can burn Omn to have their underwritten assets returned. 
    """
    key: uint256 = self.user_to_key[msg.sender]
    strike_redeem: uint256 = self.strike * option_amount / self.decimals
    assert self.lockBook.locks[key].strike_amount >= strike_redeem # Make sure user redeeming has underwritten
    assert self.balanceOf[msg.sender] >= option_amount # Check to see user has the redeeming option tokens
    self.lockBook.locks[key].strike_amount -= strike_redeem 
    self.strikeAsset.transfer(msg.sender, strike_redeem) # strike asset sent to Purchaser
    self._burn(msg.sender, option_amount) # Burn the doz tokens that were closed
    log.Close(self.lockBook.locks[key].user, option_amount, key)
    return True


@public
@payable
def exercise(option_amount: uint256) -> bool:
    """
    @notice - Buyer sends underlying asset in exchange for strike asset. 
    @param - Amount of options to exercise with 18 decimal places, 1*10**18 = 1 option
    """
    assert self.lockBook.locks[self.user_to_key[msg.sender]].strike_amount == 0 # Exercising party is not underwriter
    assert self.balanceOf[msg.sender] >= option_amount
    strike_payment: uint256 = self.strike * option_amount / self.decimals
    underlying_payment: uint256 = self.underlying * option_amount / self.decimals
    self.underlyingAsset.transferFrom(msg.sender, self, underlying_payment) # Withdraw underlying asset (2 per option) from contract
    self.strikeAsset.transfer(msg.sender, strike_payment) # Deposit strike asset (10 per option)
    assigned_user: address = ZERO_ADDRESS
    lock_key: uint256 = 0
    for x in range(1, MAX_KEY_LENGTH + 1): # Loops over underwriters and depletes underlying_payment outlays
        lock_key = convert(x, uint256)
        if(self.lockBook.highest_lock > strike_payment): # If the highest underwritten amount > payment, assign that user
            assigned_user = self.lockBook.locks[self.highest_key].user
            lock_key = self.highest_key
            break
        if(self.lockBook.locks[lock_key].strike_amount > strike_payment): # If the looped user has underwritten > payment, assign that user
            assigned_user = self.lockBook.locks[lock_key].user
            break
    if(assigned_user == ZERO_ADDRESS): # If no assigned user, need to assign multiple users
        for i in range(1, MAX_KEY_LENGTH + 1):
            lock_key = convert(i, uint256)
            user: address = self.lockBook.locks[lock_key].user # Get user address of lock_key
            strike_amount: uint256 = self.lockBook.locks[lock_key].strike_amount # Get underlying amount of user
            options_exercised: uint256 = strike_amount / self.strike * self.decimals # Get max amount of options that can be exercised
            if(strike_amount > strike_payment): # If the looped user has underwritten > underlying left, assign that user
                assigned_user = self.lockBook.locks[lock_key].user
                break
            # We need to exercise options using multiple underwritten balances
            self.underlyingAsset.transfer(user, self.underlying * options_exercised / self.decimals) # Transfer proportional strike payment to entire balance of assigned user
            strike_payment -= strike_amount # Update underlying payment leftover   
            log.Exercise(msg.sender, options_exercised, lock_key)
            self._burn(msg.sender, options_exercised) # Burn amount of tokens proportional to entire underlying balance of user
            self.lockBook.locks[lock_key].strike_amount -= strike_amount # Update user's underlying amount
        # We have a user who can pay entire leftover exercised amount
        self.underlyingAsset.transfer(assigned_user, self.underlying / self.strike * strike_payment)
        options_exercised: uint256 = strike_payment / self.strike * self.decimals
        log.Exercise(msg.sender, options_exercised, lock_key)
        self._burn(msg.sender, options_exercised)
        self.lockBook.locks[lock_key].strike_amount -= strike_payment # Assigned user exercises the rest of the underlying payment
        return True
    # We have a user who can pay entire exercised amount
    self.underlyingAsset.transfer(assigned_user, underlying_payment)
    self.lockBook.locks[lock_key].strike_amount -= strike_payment # Assigned user pays the exercised underlying amount
    log.Exercise(msg.sender, option_amount, lock_key)
    self._burn(msg.sender, option_amount)
    return True


@public
def expire() -> bool: # Anyone can call to close all remaining contract tokens
    self.expired = True
    assert self.expired
    key: uint256 = 1
    for x in range(1, MAX_KEY_LENGTH): # for each key, redeem the tokens to their owners and burn the contract tokens
        if(self.lockBook.locks[convert(x, uint256)].user == ZERO_ADDRESS):
            break
        key = convert(x, uint256)
        strike_amt: uint256 = self.lockBook.locks[key].strike_amount
        user: address = self.lockBook.locks[key].user
        if(strike_amt > 0):
            self.strikeAsset.transfer(user, strike_amt) # strike asset sent to writer
        self.lockBook.locks[key].strike_amount = 0
        log.Close(user, strike_amt / self.strike * self.decimals, key)
    self.total_supply = 0
    return True
