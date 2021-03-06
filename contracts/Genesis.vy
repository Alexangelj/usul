# @title c.M.O.A.T: Call - Multilateral Optionality Asset Transfer
# 
# @notice Implementation of a Tokenized Asset Transfer Agreement on the Ethereum Network
# 
# @author Alexander Angel
# 
# @dev Uses a factory to initialize and deploy MOAT templates
#
# @version 0.1.0b14


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

contract GenesisToken():
    def totalSupply() -> uint256:constant
    def balanceOf(_owner: address) -> uint256:constant
    def allowance(_owner: address, _spender: address) -> uint256:constant
    def transfer(_to: address, _value: uint256) -> bool:modifying
    def transferFrom(_from: address, _to: address, _value: uint256) -> bool:modifying
    def approve(_spender: address, _value: uint256) -> bool:modifying
    def mint(_to: address, _value: uint256):modifying
    def name() -> string[64]: constant
    def symbol() -> string[64]: constant
    def tokenId() -> bytes32: constant



contract Wax():
    def timeToExpiry(time: timestamp) -> bool:constant

contract InstrumentController():
    def mint(_instrumentSymbol: string[64], _user: address, _amount: uint256, _tokenId: address):modifying
    def burn(_instrumentSymbol: string[64], _user: address, _amount: uint256, _tokenId: address):modifying

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
genesisToken: public(GenesisToken)
instrumentController: public(InstrumentController)


# Administrator - For Early Versions ONLY
admin: public(address)


# Contract specific parameters
strike: public(uint256) # Denominated in strike asset
underlying: public(uint256) # Denominated in underlying asset
maturity: public(timestamp) # UNIX Timestamp
premium: public(uint256) # Temporary and initial value per MOAT token
expired: public(bool) # Expired MOAT tokens are worthless
ratio: public(uint256)

# EIP-20
name: public(string[64])
symbol: public(string[64])
decimals: public(uint256)
balanceOf: public(map(address, uint256))
allowances: map(address, map(address, uint256))
total_supply: public(uint256)
minter: public(address)


# Specifications
set: public(timestamp[4])
tokens: public(address[4])
leg: public(map(bytes32, address)) # Maps a token ID to an address
timestamps: public(map(timestamp, address)) # Maps a timestamp to a bytes 32 Token ID


# User Claims
lockBook: public(LockBook) # Struct for lists of underlying deposits
highest_key: public(uint256) # Largest underlying deposit respective key
user_to_key: public(map(address, uint256)) # Link users to their keys, 1 key per address


# Test
test: public(bytes32)
udr_address: public(address)

# Constants
MAX_KEY_LENGTH: constant(uint256) = 2**10-1 # Used for looping over the book
EXPIRATION_STAMPS: constant(uint256) = 4


@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)


# Initializer
@public
def setup(
        _controller: address,
        _name: string[64],
        _symbol: string[64],
        _ratio: uint256,
        _strikeAsset_address: address,
        _underlyingAsset_address: address,
        _set: timestamp[4],
        _tokens: address[4],
    ):
    """
    @notice                         Setup is called from the factory contract using a contract template address
    @param _controller              Address of Instrument Controller
    @param _name                    Name of this contract linked to its parameters
    @param _symbol                  Naming convention to represent the paramers -> 
                                    Strike Symbol + Underlying Symbol + UNIX Timestamp + 
                                    Type (C or P) + # of Strike tokens per # of Underlying tokens
    @param _ratio                   Strike:Underlying ratio 
    @param _strikeAsset_address     Address of strike asset contract
    @param _underlyingAsset_address  Address of underlying asset contract
    @param _set                     List of expiration times valid for contract
    @param _tokens                  Array of addresses of the tokens with respective expirations
    """
    assert(self.factory == ZERO_ADDRESS and self.admin == ZERO_ADDRESS) and msg.sender != ZERO_ADDRESS
    
    
    # Administrative variables
    self.factory = Factory(msg.sender)
    self.instrumentController = InstrumentController(_controller)
    self.admin = _controller


    self.set = _set
    self.tokens = _tokens

    self.genesisToken = GenesisToken(_tokens[0])
    self.test = self.genesisToken.tokenId()

    # Interfaces
    self.strikeAsset = StrikeAsset(_strikeAsset_address)
    self.underlyingAsset = UnderlyingAsset(_underlyingAsset_address)

    # EIP-20 Standard
    self.name = _name
    self.symbol = _symbol
    self.decimals = 10**18
    self.balanceOf[_controller] = 0
    self.total_supply = 0
    self.minter = _controller
    log.Transfer(ZERO_ADDRESS, _controller, 0)

    self.ratio = _ratio

    # Set first book account to admin
    self.lockBook.locks[0].user = msg.sender

    # Test
    self.udr_address = _underlyingAsset_address


# Utility
@public
def activate() -> bool:
    for i in range(EXPIRATION_STAMPS):
        #token: GenesisToken = GenesisToken(self.tokens[i])
        #tokenId: bytes32 = GenesisToken(self.tokens[i]).tokenId()
        #self.leg[tokenId] = self.tokens[i]
        #self.timestamps[self.set[i]] = tokenId
        self.timestamps[self.set[i]] = self.tokens[i]
    return True


@public
def isMature() -> bool:
    """
    @dev Checks maturity conditions
    """
    self.expired = self.wax.timeToExpiry(self.maturity)
    return self.expired


# Core
@public
def write(deposit: uint256, _tokenAddress: address) -> bool:
    """
    @dev Writer mints tokens: 
                   Underwritten Amount 
           cMOAT = ___________________
                   Underlying Parameter
    @param deposit Deposit amount of underlying assets, 18 decimal places
    """
    lock_key: uint256 = 0 # Temp variable 'lock key' index
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
    self.underlyingAsset.transferFrom(msg.sender, self, deposit) # User deposits underwritten amount into contract
    self.instrumentController.mint(self.symbol, msg.sender, deposit, _tokenAddress)
    log.Write(msg.sender, deposit, lock_key)
    return True


@public
def close(amount: uint256, _tokenAddress: address) -> bool:
    """
    @dev Writer can burn cMOAT tokens to redeem their underlying deposits
    @param amount Amount of cMOAT tokens to burn, 18 decimals  
    """
    key: uint256 = self.user_to_key[msg.sender]
    assert self.lockBook.locks[key].underlying_amount >= amount # Check user redeeming has underwritten
    assert GenesisToken(_tokenAddress).balanceOf(msg.sender) >= amount # Check user has tokens to burn
    self.lockBook.locks[key].underlying_amount -= amount
    self.instrumentController.burn(self.symbol, msg.sender, amount, _tokenAddress) # Burn the cMOAT tokens that were redeemed for underwritten assets 
    self.underlyingAsset.transfer(msg.sender, amount) # Underlying asset redeemed to user
    log.Close(self.lockBook.locks[key].user, amount, key)
    return True


@public
def exercise(amount: uint256, _tokenAddress: address) -> bool:
    """
    @dev Exercising party exchanges strike asset for underlying asset
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
            self.instrumentController.burn(self.symbol, msg.sender, options_exercised, _tokenAddress) # Burn amount of tokens proportional to entire underlying balance of user
            self.lockBook.locks[lock_key].underlying_amount -= underlying_amount # Update user's underlying amount
        # We have a user who can pay entire leftover exercised amount
        self.strikeAsset.transfer(assigned_user, self.strike / self.underlying * underlying_payment)
        options_exercised: uint256 = underlying_payment / self.underlying * self.decimals
        log.Exercise(msg.sender, options_exercised, lock_key)
        self.instrumentController.burn(self.symbol, msg.sender, options_exercised, _tokenAddress)
        self.lockBook.locks[lock_key].underlying_amount -= underlying_payment # Assigned user exercises the rest of the underlying payment
        return True
    
    
    # We have a user who can pay entire exercised amount
    self.strikeAsset.transfer(assigned_user, strike_payment)
    self.lockBook.locks[lock_key].underlying_amount -= underlying_payment # Assigned user pays the exercised underlying amount
    log.Exercise(msg.sender, amount, lock_key)
    self.instrumentController.burn(self.symbol, msg.sender, amount, _tokenAddress)
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