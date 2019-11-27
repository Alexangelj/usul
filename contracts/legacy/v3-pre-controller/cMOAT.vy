# @title c.M.O.A.T: Call - Multilateral Optionality Asset Transfer
# 
# @notice Implementation of a Tokenized Asset Transfer Agreement on the Ethereum Network
# 
# @author Alexander Angel
# 
# @dev Uses a factory to initialize and deploy MOAT templates
#
# @version 0.1.0b14


from vyper.interfaces import ERC20
implements: ERC20


# Structs
struct Account:
    user: address
    underlying_amount: uint256


struct LockBook:
    locks: map(uint256, Account)
    lock_key: uint256
    lock_length: uint256
    highest_lock: uint256


# Interfaces
contract Factory():
    def getDoz(user_addr: address) -> address:constant
    def getUser(omn: address) -> address:constant


contract StrikeAsset():
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


# Administrator - For Early Versions ONLY
admin: address


# Contract specific parameters
strike: public(uint256) # Denominated in strike asset
underlying: public(uint256) # Denominated in underlying asset
maturity: public(timestamp) # UNIX Timestamp
premium: public(uint256) # Temporary and initial value per MOAT token
expired: public(bool) # Expired MOAT tokens are worthless


# EIP-20
name: public(string[64])
symbol: public(string[64])
decimals: public(uint256)
balanceOf: public(map(address, uint256))
allowances: map(address, map(address, uint256))
total_supply: public(uint256)
minter: public(address)


# User Claims
lockBook: public(LockBook) # Struct for lists of underlying deposits
highest_key: public(uint256) # Largest underlying deposit respective key
user_to_key: public(map(address, uint256)) # Link users to their keys, 1 key per address


# Constants
MAX_KEY_LENGTH: constant(uint256) = 2**10-1 # Used for looping over the book


@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)


# Initializer
@public
def setup(  _strike: uint256,
            _underlying: uint256,
            _maturity: timestamp,
            _wax_address: address,
            _strikeAsset_address: address,
            _underlyingAsset_address: address,
            _name: string[64],
            _symbol: string[64],
            ):
    """
    @notice                         Setup is called from the factory contract using a contract template address
    @param _strike                  Number of strike asset tokens, 18 decimals
    @param _underlying              Number of underlying asset tokens, 18 decimals
    @param _maturity                UNIX timestamp for token expiry
    @param _wax_address             Contract address for auxillarly maturity condition checking
    @param _strikeAsset_address     Address of strike asset contract
    @param _underlyingAsst_address  Address of underlying asset contract
    @param _name                    Name of this contract linked to its parameters
    @param _symbol                  Naming convention to represent the paramers -> 
                                    Strike Symbol + Underlying Symbol + UNIX Timestamp + 
                                    Type (C or P) + # of Strike tokens per # of Underlying tokens
    """
    assert(self.factory == ZERO_ADDRESS and self.admin == ZERO_ADDRESS) and msg.sender != ZERO_ADDRESS
    
    
    # Administrative variables
    self.factory = Factory(msg.sender)
    self.admin = tx.origin
    
    # Contract Parameters
    self.strike = _strike
    self.underlying = _underlying
    self.maturity = _maturity

    # Interfaces
    self.strikeAsset = StrikeAsset(_strikeAsset_address)
    self.underlyingAsset = UnderlyingAsset(_underlyingAsset_address)
    self.wax = Wax(_wax_address)

    # EIP-20 Standard
    self.name = _name
    self.symbol = _symbol
    self.decimals = 10**18
    self.balanceOf[tx.origin] = 0
    self.total_supply = 0
    self.minter = tx.origin
    log.Transfer(ZERO_ADDRESS, tx.origin, 0)

    # Set first book account to admin
    self.lockBook.locks[0].user = tx.origin


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


# Utility
@public
def isMature() -> bool:
    """
    @dev Checks maturity conditions
    """
    self.expired = self.wax.timeToExpiry(self.maturity)
    return self.expired


# Core
@public
@payable
def write(deposit: uint256) -> bool:
    """
    @dev   Writer mints tokens: 
                   Underwritten Amount 
           cMOAT = ___________________
                   Underlying Parameter
    @param deposit Deposit amount of underlying assets, 18 decimal places
    """
    lock_key: uint256 = 0 # Temp variable lock key number
    if(self.user_to_key[msg.sender] > 0): # If user has a key, use their key
        lock_key = self.user_to_key[msg.sender]
        self.lockBook.locks[lock_key].underlying_amount += deposit
    else: # Else, increment key length, and set a new Account
        lock_key = self.lockBook.lock_length + 1 # Temporary lock key is length + 1
        self.lockBook.lock_length += 1 # Increment the lock key length
        self.user_to_key[msg.sender] = lock_key # Set user address to lock key
        self.lockBook.locks[lock_key] = Account({user: msg.sender, underlying_amount: deposit}) # Create new account at [key]
    if(self.lockBook.locks[lock_key].underlying_amount > self.lockBook.highest_lock): # If underlying amount is greater, set new highest_key
        self.lockBook.highest_lock = self.lockBook.locks[lock_key].underlying_amount
        self.highest_key = lock_key
    token_amount: uint256 = deposit * self.decimals / self.underlying  # Example: Underlying Parameter = 2, so if underwriten amount is  12, 12 / 2 = 6 cMOAT tokens minted
    self.underlyingAsset.transferFrom(msg.sender, self, deposit) # User deposits underwritten amount into contract
    self.mint(msg.sender, token_amount)
    log.Write(msg.sender, token_amount, lock_key)
    return True


@public
@payable
def close(amount: uint256) -> bool:
    """
    @dev          Writer can burn cMOAT tokens to redeem their underlying deposits
    @param amount Amount of cMOAT tokens to burn, 18 decimals  
    """
    key: uint256 = self.user_to_key[msg.sender]
    underlying_redeem: uint256 = self.underlying * amount / self.decimals
    assert self.lockBook.locks[key].underlying_amount >= underlying_redeem # Check user redeeming has underwritten
    assert self.balanceOf[msg.sender] >= amount # Check user has cMOAT tokens to burn
    self.lockBook.locks[key].underlying_amount -= underlying_redeem 
    self.underlyingAsset.transfer(msg.sender, underlying_redeem) # Underlying asset redeemed to user
    self._burn(msg.sender, amount) # Burn the cMOAT tokens that were redeemed for underwritten assets
    log.Close(self.lockBook.locks[key].user, amount, key)
    return True


@public
@payable
def exercise(amount: uint256) -> bool:
    """
    @dev   Exercising party exchanges strike asset for underlying asset
    @param Amount of cMOAT tokens being exercised, 18 decimals
    """
    assert self.balanceOf[msg.sender] >= amount
    strike_payment: uint256 = self.strike * amount / self.decimals
    underlying_payment: uint256 = self.underlying * amount / self.decimals
    self.strikeAsset.transferFrom(msg.sender, self, strike_payment) # Deposit strike asset (10 per option)
    self.underlyingAsset.transfer(msg.sender, underlying_payment) # Withdraw underlying asset (2 per option) from contract
    assigned_user: address = ZERO_ADDRESS
    lock_key: uint256 = 0
    
    
    for x in range(1, MAX_KEY_LENGTH + 1): # Loops over underwriters and depletes underlying_payment outlays
        lock_key = convert(x, uint256)
        if(self.lockBook.highest_lock > underlying_payment): # If the highest underwritten amount > payment, assign that user
            assigned_user = self.lockBook.locks[self.highest_key].user
            lock_key = self.highest_key
            break
        if(self.lockBook.locks[lock_key].underlying_amount > underlying_payment): # If the looped user has underwritten > payment, assign that user
            assigned_user = self.lockBook.locks[lock_key].user
            break

    
    if(assigned_user == ZERO_ADDRESS): # If no assigned user, need to assign multiple users
        for i in range(1, 3):
            lock_key = convert(i, uint256)
            user: address = self.lockBook.locks[lock_key].user # Get user address of lock_key
            underlying_amount: uint256 = self.lockBook.locks[lock_key].underlying_amount # Get underlying amount of user
            options_exercised: uint256 = underlying_amount * self.decimals / self.underlying  # Get max amount of options that can be exercised
            if(underlying_amount > underlying_payment): # If the looped user has underwritten > underlying left, assign that user
                assigned_user = self.lockBook.locks[lock_key].user
                break
            # We need to exercise options using multiple underwritten balances
            if(user == ZERO_ADDRESS): # If we pass over all users but there are still options oustanding to be exercised, set previous user as user
                user = self.lockBook.locks[lock_key - 1].user
                break
            self.strikeAsset.transfer(user, self.strike / self.decimals * options_exercised ) # Transfer proportional strike payment to entire balance of assigned user
            underlying_payment -= underlying_amount # Update underlying payment leftover   
            log.Exercise(msg.sender, options_exercised, lock_key)
            self._burn(msg.sender, options_exercised) # Burn amount of tokens proportional to entire underlying balance of user
            self.lockBook.locks[lock_key].underlying_amount -= underlying_amount # Update user's underlying amount
        # We have a user who can pay entire leftover exercised amount
        self.strikeAsset.transfer(assigned_user, self.strike / self.underlying * underlying_payment)
        options_exercised: uint256 = underlying_payment / self.underlying * self.decimals
        log.Exercise(msg.sender, options_exercised, lock_key)
        self._burn(msg.sender, options_exercised)
        self.lockBook.locks[lock_key].underlying_amount -= underlying_payment # Assigned user exercises the rest of the underlying payment
        return True
    
    
    # We have a user who can pay entire exercised amount
    self.strikeAsset.transfer(assigned_user, strike_payment)
    self.lockBook.locks[lock_key].underlying_amount -= underlying_payment # Assigned user pays the exercised underlying amount
    log.Exercise(msg.sender, amount, lock_key)
    self._burn(msg.sender, amount)
    return True


@public
def expire() -> bool:
    """
    @notice Any user can call this public function to expire this specific cMOAT token
    @dev    Sets total supply to 0, does not burn any tokens
    """
    self.expired = True # FIX: temporary test store
    assert self.expired # cMOAT's UNIX timestamp < block.timestamp
    key: uint256 = 1 # Temporary key value 
    for x in range(1, MAX_KEY_LENGTH): # For each key, redeem the tokens to their underwriters, burn the cMOAT tokens
        if(self.lockBook.locks[convert(x, uint256)].user == ZERO_ADDRESS): # If we reach end of users in the lock book, end the loop
            break
        key = convert(x, uint256)
        underlying_amt: uint256 = self.lockBook.locks[key].underlying_amount
        user: address = self.lockBook.locks[key].user
        if(underlying_amt > 0):
            self.underlyingAsset.transfer(user, underlying_amt) # underlying asset sent to writer
        self.lockBook.locks[key].underlying_amount = 0
        log.Close(user, underlying_amt / self.underlying * self.decimals, key)
    self.total_supply = 0
    return True