# @title A Right to Call - Physically Settled ERC 20 Token
# 
# @notice Implementation of a Tokenized American Call Option on the Ethereum Network
# 
# @author Alexander Angel
# 
# @dev Uses a factory to initialize and deploy option contracts
#
# @version 0.1.0b14

#from vyper.interfaces import ERC20
#
#implements: ERC20

contract Factory():
    def getEco(user_addr: address) -> address:constant
    def getUser(eco: address) -> address:constant

contract Slate():
    def bought(_option: address) -> address:constant
    def wrote(_option: address) -> address:constant
    def premium(_option: address) -> uint256:constant
    def write(_option: address, prm: uint256, underlying: uint256) -> bool:modifying
    def purchase(_option: address, prm: uint256) -> bool:modifying
    def withdraw(val: uint256) -> bool:modifying

contract Stash():
    def fund(addr: address) -> uint256:constant
    def deposit(_writer: address, underlying: uint256) -> bool:modifying
    def withdraw(val: uint256) -> bool:modifying
    def write(_option: address, _underlying: uint256) -> bool:modifying
    
contract Wax():
    def timeToExpiry(time: timestamp) -> bool:constant
    
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
    


Valid: event({eco: indexed(address)})
Buy: event({eco: indexed(address)})
Write: event({eco: indexed(address)})
Exercise: event({eco: indexed(address)})
Mature: event({eco: indexed(address)})
Payment: event({amount: wei_value, source: indexed(address)})
# EIP-20 Events
Transfer: event({_from: indexed(address), _to: indexed(address), _value: uint256})
Approval: event({_owner: indexed(address), _spender: indexed(address), _value: uint256})

# Can delete
Error: event({fund: uint256, margn: uint256})


# Interface Contracts
factory: public(Factory)
slate: public(Slate)
stash: public(Stash)
wax: public(Wax)
strikeAsset: public(StrikeAsset)
underlyingAsset: public(UnderlyingAsset)
# Probably can delete
user: address

# Contract parameters
strike: public(uint256)
underlying: public(uint256)
maturity: public(timestamp)

# Exercise Conditions
active: public(bool)
completed: public(bool)
expiration: public(timestamp)

# EIP-20
name: public(string[64])
symbol: public(string[32])
decimals: public(uint256)
balanceOf: public(map(address, uint256))
allowances: map(address, map(address, uint256))
total_supply: uint256
minter: address

@public
@payable
def __default__():
    log.Payment(msg.value, msg.sender)

@public
def setup(  _strikeAsset: uint256,
            _underlying: uint256,
            _maturity: timestamp,
            _slate_address: address,
            _stash_address: address,
            _wax_address: address,
            _strikeAsset_address: address,
            _underlyingAsset_address: address,
            ):
    """
    @notice Setup is called from the factory contract using an ECO contract template address
    """
    assert(self.factory == ZERO_ADDRESS and self.user == ZERO_ADDRESS) and msg.sender != ZERO_ADDRESS
    self.factory = Factory(msg.sender)
    
    self.strike = _strikeAsset
    self.underlying = _underlying
    self.maturity = _maturity

    self.active = False
    self.completed = False

    # New
    self.slate = Slate(_slate_address)
    self.stash = Stash(_stash_address)
    self.wax = Wax(_wax_address)
    self.strikeAsset = StrikeAsset(_strikeAsset_address)
    self.underlyingAsset = UnderlyingAsset(_underlyingAsset_address)
    self.expiration = block.timestamp + (60 * 60 * 24 * 1)
    self.strikeAsset.approve(self.slate, 1000000000000000*10**18)
    self.underlyingAsset.approve(self.stash, 1000000000000000*10**18)

    # EIP-20
    init_supply: uint256 = 0
    self.name = "Dai Oat December"
    self.symbol = "DOZ"
    self.decimals = 10**18
    self.balanceOf[tx.origin] = init_supply
    self.total_supply = init_supply
    self.minter = tx.origin
    log.Transfer(ZERO_ADDRESS, tx.origin, init_supply)

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
    assert _to == self.minter
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
@constant
def isMature() -> bool:
    """
    @notice ECOs have a time to expiration, this checks if it has expired
    """
    return self.wax.timeToExpiry(self.maturity)

@public
@payable
def write(_underlying: uint256) -> bool:
    """
    @notice Seller writes ECO Contract, Deposits underlying, Seller is authorized
    """
    self.underlyingAsset.transferFrom(msg.sender, self.stash, _underlying)
    self.stash.write(self, _underlying)
    log.Write(self)
    self.mint(msg.sender, 10**18) # 1 default token minted
    return True
    #return self.slate.write(self, prm, _underlying)

@public
@payable
def purchase(prm: uint256) -> bool:
    """
    @notice Buyer purchases ECO for Premium:wei, Seller can claim Premium, Buyer is authorized
    """
    send(self.slate, msg.value)
    log.Buy(self)
    return self.slate.purchase(self, prm)


@public
def validate() -> bool:
    """
    @notice Checks if inactive, Checks Buyer & Seller's Authorization, Sends Premium to Seller, Activates Contract
    """
    assert not self.active, 'Should be inactive'
    assert not self.completed, 'Shouldnt be completed'
    assert self.stash.fund(self.slate.wrote(self)) > 0 # Looks up underlying
    assert self.slate.premium(self.slate.bought(self)) > 0 # Looks up premium

    # This tx looks confusing but it's not, it's just looking up what the premium is.
    # Calling withdraw function of slate, which transfers an amt defined in parameter to the tx.origin of this tx
    # The argument is looking up the premium value by looking up the buyer
    # It's looking up the buyer by using this option's address, which is a map in slate.
    self.slate.withdraw(self.slate.premium(self.slate.bought(self))) # Slate payment to writer equal to premium paid

    self.active = True
    log.Valid(self)
    return True

@public
@payable
def exercise() -> bool:
    """
    @notice If called from Buyer, Sends price * underlying Ether to Buyer, Sends strikeAsset * underlying to Seller, Completes
    """
    assert self.active
    assert msg.sender == self.slate.bought(self)

    send(self.slate, msg.value) # Purchase of underlying asset * underlying amount @ strikeAsset price is sent to Slate
    self.slate.withdraw(self.strike * self.underlying) # Writer receives payment from Slate
    self.stash.withdraw(self.stash.fund(self.slate.wrote(self))) # Purchaser receives underlying asset * underlying amount

    self.active = False
    self.completed = True
    log.Exercise(self)
    return True
