# @title A Decentralized Exchange for MOAT Tokens
# 
# @notice Implementation of a fulfilling orderbook with bid/ask
# 
# @author Alexander Angel, 
#         Luke Schoen's Solidity Dex: https://github.com/ltfschoen/dex/blob/master/contracts/Exchange.sol
# 
# @dev 
#
# @version 0.1.0b14

# Books
struct Offer:
    amount_tokens: uint256
    user: address

struct OrderBook:
    highPrice: wei_value
    lowPrice: wei_value
    offers: map(uint256, Offer)
    offers_key: uint256
    offers_len: uint256

struct Token:
    token_contract: address
    symbol: string[64]
    buyBook: map(wei_value, OrderBook)
    current_buy_price: wei_value
    lowest_buy_price: wei_value
    amount_buy_prices: uint256
    sellBook: map(wei_value, OrderBook)
    current_sell_price: wei_value
    highest_sell_price: wei_value
    amount_sell_prices: uint256


# EIP-20 Interface
contract Erc20():
    def totalSupply() -> uint256:constant
    def balanceOf(_owner: address) -> uint256:constant
    def allowance(_owner: address, _spender: address) -> uint256:constant
    def transfer(_to: address, _value: uint256) -> bool:modifying
    def transferFrom(_from: address, _to: address, _value: uint256) -> bool:modifying
    def approve(_spender: address, _value: uint256) -> bool:modifying


# Events

# Tokens
AddToken: event({_symbolIndex: indexed(int128), _token: string[64], _timestamp: timestamp})
TokenDeposit: event({_from: indexed(address), _symbolIndex: indexed(int128), _amount_tokens: uint256, _timestamp: timestamp})
TokenWithdraw: event({_to: indexed(address), _symbolIndex: indexed(int128), _amount_tokens: uint256, _timestamp: timestamp})

# Ether
EthDeposit: event({_from: indexed(address), _amountWei: wei_value, _timestamp: timestamp})
EthWithdraw: event({_to: indexed(address), _amountWei: wei_value, _timestamp: timestamp})

# New Buy/Sell Order
NewLimitBuyOrder: event({_symbolIndex: indexed(int128), _who: indexed(address), _amount_tokens: uint256, _priceWei: wei_value, _orderKey: uint256})
NewLimitSellOrder: event({_symbolIndex: indexed(int128), _who: indexed(address), _amount_tokens: uint256, _priceWei: wei_value, _orderKey: uint256})

# Fulfillment of Order
FulfilledBuyOrder: event({_symbolIndex: indexed(int128), _amount_tokens: uint256, _priceWei: wei_value, _orderKey: uint256})
FulfilledSellOrder: event({_symbolIndex: indexed(int128), _amount_tokens: uint256, _priceWei: wei_value, _orderKey: uint256})

# Cancellation
CanceledBuyOrder: event({_symbolIndex: indexed(int128), _priceWei: wei_value, _orderKey: uint256})
CanceledSellOrder: event({_symbolIndex: indexed(int128), _priceWei: wei_value, _orderKey: uint256})

# Debug Logger
Error: event({err: string[64]})

# Token Indexing and Identification
tokens: public(map(int128, Token))
symbol_index: int128

# Token ERC-20
token: Erc20

# Balance Tracker
tokenBalances: public(map(address, map(int128, uint256))) # Maps an address to a map of token ID and amount of tokens
ethBalances: public(map(address, wei_value))

# Ownership
admin: address

# Other
decimals: uint256
listBuyPrices: wei_value[10]
listBuyVolume: uint256[10]

MAX_ORDERS: constant(uint256) = 2**10 - 1

# Initialize
@public
def __init__():
    self.admin = tx.origin
    self.decimals = 10**18


# Utility
@private
@constant
def stringEquality(_a: string[64], _b: string[64]) -> bool:
    if(sha256(_a) == sha256(_b)):
        return True
    else:
        return False


@private
@constant
def getSymbolIndex(symbol_name: string[64]) -> int128:
    """
    @notice - Gets symbol index
    @param - String of Symbol to get index of
    @return - Returns index or 0 if not indexed
    """
    for x in range(100):
        if(self.stringEquality(self.tokens[x].symbol, symbol_name)):
            return x
    return 0

@private
@constant
def exchangeHasToken(symbol_name: string[64]) -> bool:
    """
    @notice - Checks exchange to see if it has token
    @param - String of symbol
    """
    index: int128 = self.getSymbolIndex(symbol_name)
    if(index == 0):
        return False
    else:
        return True



# Deposit and Withdraw Ether
@public
@payable
def depositEth():
    """
    @notice - User can deposit Ether into Dex to trade with
    """
    assert self.ethBalances[msg.sender] + msg.value >= self.ethBalances[msg.sender]
    self.ethBalances[msg.sender] += msg.value
    log.EthDeposit(msg.sender, msg.value, block.timestamp)


@public
def withdrawEth(amountWei: wei_value):
    """
    @notice - User can freely withdraw from Dex
    """
    assert self.ethBalances[msg.sender] - amountWei >= 0
    assert self.ethBalances[msg.sender] - amountWei <= self.ethBalances[msg.sender]
    self.ethBalances[msg.sender] -= amountWei
    send(msg.sender, amountWei)
    log.EthWithdraw(msg.sender, amountWei, block.timestamp)


# Manage tokens traded on exchange
@public
def addToken(symbol_name: string[64], erc20_token_address: address):
    """
    @notice - Adds a new token to the exchange
    """
    assert msg.sender == self.admin
    assert not self.exchangeHasToken(symbol_name) # Check the list of tokens
    self.symbol_index += 1
    self.tokens[self.symbol_index].symbol = symbol_name
    self.tokens[self.symbol_index].token_contract = erc20_token_address
    log.AddToken(self.symbol_index, symbol_name, block.timestamp)


# Deposit and Withdraw Tokens
@public
def depositToken(symbol_name: string[64], amount_tokens: uint256):
    """
    @notice - Deposits Token into DEX
    """
    _symbolIndex: int128 = self.getSymbolIndex(symbol_name) # Gets symbol index in memory
    assert self.tokens[_symbolIndex].token_contract != ZERO_ADDRESS # Checks the Token has been initialized
    self.token = Erc20(self.tokens[_symbolIndex].token_contract) # Sets Interface for token
    assert_modifiable(self.token.transferFrom(msg.sender, self, amount_tokens)) # Asserts transfer successful
    self.tokenBalances[msg.sender][_symbolIndex] += amount_tokens # Updates balance
    log.TokenDeposit(msg.sender, _symbolIndex, amount_tokens, block.timestamp)


@public
def withdrawToken(symbol_name: string[64], amount_tokens: uint256):
    """
    @notice - Withdraws Token into DEX
    """
    _symbolIndex: int128 = self.getSymbolIndex(symbol_name) # Gets symbol index in memory
    assert self.tokens[_symbolIndex].token_contract != ZERO_ADDRESS # Checks the Token has been initialized
    self.token = Erc20(self.tokens[_symbolIndex].token_contract) # Sets Interface for token
    assert self.tokenBalances[msg.sender][_symbolIndex] >= amount_tokens # Checks Bal >= withdraw
    self.tokenBalances[msg.sender][_symbolIndex] -= amount_tokens # Updates Balance
    assert_modifiable(self.token.transfer(msg.sender, amount_tokens)) # Asserts transfer successful
    log.TokenWithdraw(msg.sender, _symbolIndex, amount_tokens, block.timestamp)


@public
@constant
def getTokenBalance(symbol_name: string[64]) -> uint256:
    _symbolIndex: int128 = self.getSymbolIndex(symbol_name)
    return self.tokenBalances[msg.sender][_symbolIndex]


# Order Book - BID Orders
@public
def getBuyOrderBook(symbol_name: string[64]) -> wei_value[10]:
    _symbolIndex: int128 = self.getSymbolIndex(symbol_name) # Gets symbol index in memory
    whilePrice: wei_value = self.tokens[_symbolIndex].lowest_buy_price
    counter: uint256 = 0
    if(self.tokens[_symbolIndex].current_buy_price > as_wei_value(0, 'ether')):
        for x in range(MAX_ORDERS):
            if(whilePrice > self.tokens[_symbolIndex].current_buy_price):
                break
            self.listBuyPrices[counter] = whilePrice
            buyVolumeAtPrice: uint256 = 0
            buyOffersKey: uint256 = 0
            buyOffersKey = self.tokens[_symbolIndex].buyBook[whilePrice].offers_key
            for i in range(MAX_ORDERS):
                if(buyOffersKey > self.tokens[_symbolIndex].buyBook[whilePrice].offers_len):
                    break
                buyVolumeAtPrice += self.tokens[_symbolIndex].buyBook[whilePrice].offers[buyOffersKey].amount_tokens
                buyOffersKey += 1
            self.listBuyVolume[counter] = buyVolumeAtPrice
            if(whilePrice == self.tokens[_symbolIndex].buyBook[whilePrice].highPrice):
                break
            else:
                whilePrice = self.tokens[_symbolIndex].buyBook[whilePrice].highPrice
            counter += 1
    return self.listBuyPrices



# Bid Limit Order
@private
def addBuyOffer(symbol_index: int128, priceWei: wei_value, amount: uint256, user: address):
    self.tokens[symbol_index].buyBook[priceWei].offers_len += 1 # Offers incr. by 1
    self.tokens[symbol_index].buyBook[priceWei].offers[self.tokens[symbol_index].buyBook[priceWei].offers_len] = Offer({amount_tokens: amount, user: user})

    if(self.tokens[symbol_index].buyBook[priceWei].offers_len == 1): 
        self.tokens[symbol_index].buyBook[priceWei].offers_key = 1
        self.tokens[symbol_index].amount_buy_prices += 1 # New buy order received
        current_buy_price: wei_value = self.tokens[symbol_index].current_buy_price
        lowest_buy_price: wei_value = self.tokens[symbol_index].lowest_buy_price
        # Buy offer is either First order or Lowest entry
        if(lowest_buy_price == 0 or lowest_buy_price > priceWei):     
            if(current_buy_price == 0): # First entry, No orders exist
                self.tokens[symbol_index].current_buy_price = priceWei # Set current price to price offer
                self.tokens[symbol_index].buyBook[priceWei].highPrice = priceWei # Set higher price to first order
                self.tokens[symbol_index].buyBook[priceWei].lowPrice = 0 # Set lower price to 0
            else: # New buy offer is lowest entry lowPrice > priceWei
                self.tokens[symbol_index].buyBook[lowest_buy_price].lowPrice = priceWei # Set Buy book lowest price to New order price
                self.tokens[symbol_index].buyBook[priceWei].highPrice = lowest_buy_price
                self.tokens[symbol_index].buyBook[priceWei].lowPrice = 0
            self.tokens[symbol_index].lowest_buy_price = priceWei
        elif(current_buy_price < priceWei): # New buy offer is highest buy price
            self.tokens[symbol_index].buyBook[current_buy_price].highPrice = priceWei
            self.tokens[symbol_index].buyBook[priceWei].highPrice = priceWei
            self.tokens[symbol_index].buyBook[priceWei].lowPrice = current_buy_price
            self.tokens[symbol_index].current_buy_price = priceWei
        else: # New Buy offer is between existing lowest and highest buy prices
            buyPrice: wei_value = self.tokens[symbol_index].current_buy_price
            foundInsert: bool = False
            for i in range(MAX_ORDERS):
                if(buyPrice < priceWei and self.tokens[symbol_index].buyBook[buyPrice].highPrice > priceWei):
                    self.tokens[symbol_index].buyBook[priceWei].lowPrice = buyPrice
                    self.tokens[symbol_index].buyBook[priceWei].highPrice = self.tokens[symbol_index].buyBook[buyPrice].highPrice
                    self.tokens[symbol_index].buyBook[self.tokens[symbol_index].buyBook[buyPrice].highPrice].lowPrice = priceWei # Set order books higher price entry low price to the new offer
                    self.tokens[symbol_index].buyBook[buyPrice].highPrice = priceWei # Set order book lower price entry higher price to the new order price
                    foundInsert = True # Higher buy price > offer price and Offer price > entry price
                buyPrice = self.tokens[symbol_index].buyBook[buyPrice].lowPrice
                if(foundInsert):
                    break


@private
def createBuyLimitOrderUnmatched(sender: address, symbol_name: string[64], symbol_index: int128, priceWei: wei_value, amount_tokens_required: uint256, total_eth_required: wei_value):
    """
    @notice - If a buy order is unmatched it will call this function
    """
    total_eth_available: wei_value = total_eth_required # Ether balance required to purchase token
    self.ethBalances[sender] -= total_eth_available # Use exchange balance for new order
    self.addBuyOffer(symbol_index, priceWei, amount_tokens_required, sender)
    log.NewLimitBuyOrder(symbol_index, sender, amount_tokens_required, priceWei, self.tokens[symbol_index].buyBook[priceWei].offers_len)


@public
def buyToken(symbol_name: string[64], priceWei: wei_value, amount: uint256):
    """
    @notice - Submit a New Bid Order
    """
    _symbolIndex: int128 = self.getSymbolIndex(symbol_name) # Gets symbol index in memory
    total_eth_required: wei_value = as_wei_value(0, 'ether')
    amount_tokens_required: uint256 = amount

    if(self.tokens[_symbolIndex].amount_sell_prices == 0 or self.tokens[_symbolIndex].amount_sell_prices > priceWei):
        #log.Error('Create Buy limit order for unmatched 1')
        self.createBuyLimitOrderUnmatched(msg.sender, symbol_name, _symbolIndex, priceWei, amount_tokens_required, total_eth_required)
    else:
        # Execute market order
        # If: Sell Order Limit on book is less than or equal to buy priceWei offered
        total_eth_available: wei_value = as_wei_value(0, 'ether')
        whilePrice: wei_value = self.tokens[_symbolIndex].current_sell_price
        offers_key: uint256 = 0
        
        for i in range(MAX_ORDERS):
            if(whilePrice > priceWei or amount_tokens_required == 0):
                break
            offers_key = self.tokens[_symbolIndex].sellBook[whilePrice].offers_key
            for x in range(MAX_ORDERS):
                if(offers_key > self.tokens[_symbolIndex].sellBook[whilePrice].offers_len or amount_tokens_required == 0):
                    break
                volume_price_address: uint256 = self.tokens[_symbolIndex].sellBook[whilePrice].offers[offers_key].amount_tokens
                if(volume_price_address <= amount_tokens_required):
                    total_eth_available = volume_price_address * whilePrice / self.decimals
                    assert self.ethBalances[msg.sender] >= total_eth_available
                    self.ethBalances[msg.sender] -= total_eth_available
                    self.tokenBalances[msg.sender][_symbolIndex] += volume_price_address
                    self.tokens[_symbolIndex].sellBook[whilePrice].offers[offers_key].amount_tokens = 0
                    self.ethBalances[self.tokens[_symbolIndex].sellBook[whilePrice].offers[offers_key].user] += total_eth_available
                    self.tokens[_symbolIndex].sellBook[whilePrice].offers_key += 1
                    log.FulfilledBuyOrder(_symbolIndex, volume_price_address, whilePrice, offers_key)
                    amount_tokens_required -= volume_price_address
                else:
                    assert self.tokens[_symbolIndex].sellBook[whilePrice].offers[offers_key].amount_tokens > amount_tokens_required
                    total_eth_required = amount_tokens_required * whilePrice / self.decimals
                    self.ethBalances[msg.sender] -= total_eth_required
                    self.tokens[_symbolIndex].sellBook[whilePrice].offers[offers_key].amount_tokens -= amount_tokens_required
                    self.ethBalances[self.tokens[_symbolIndex].sellBook[whilePrice].offers[offers_key].user] += total_eth_required
                    self.tokenBalances[msg.sender][_symbolIndex] += amount_tokens_required
                    amount_tokens_required = 0
                    log.FulfilledBuyOrder(_symbolIndex, amount_tokens_required, whilePrice, offers_key)
                if( offers_key == self.tokens[_symbolIndex].sellBook[whilePrice].offers_len and 
                    self.tokens[_symbolIndex].sellBook[whilePrice].offers[offers_key].amount_tokens == 0):
                    self.tokens[_symbolIndex].amount_sell_prices -= 1
                    if( whilePrice == self.tokens[_symbolIndex].sellBook[whilePrice].highPrice or
                        self.tokens[_symbolIndex].sellBook[whilePrice].highPrice == 0):
                        self.tokens[_symbolIndex].current_sell_price = 0
                    else:
                        self.tokens[_symbolIndex].current_sell_price = self.tokens[_symbolIndex].sellBook[whilePrice].highPrice
                        self.tokens[_symbolIndex].sellBook[self.tokens[_symbolIndex].sellBook[whilePrice].highPrice].lowPrice = 0
                offers_key += 1
            whilePrice = self.tokens[_symbolIndex].current_sell_price
        if(amount_tokens_required > 0):
            # create Buy limit order for tokens unable to match with a sell order for a buyer
            #log.Error('Create Buy limit order for unmatched 2')
            self.createBuyLimitOrderUnmatched(msg.sender, symbol_name, _symbolIndex, priceWei, amount_tokens_required, total_eth_required)
    


# New Order - ASK Order
@private
def addSellOffer(symbol_index: int128, priceWei: wei_value, amount: uint256, user: address):
    self.tokens[symbol_index].sellBook[priceWei].offers_len += 1 # Offers incr. by 1
    self.tokens[symbol_index].sellBook[priceWei].offers[self.tokens[symbol_index].sellBook[priceWei].offers_len] = Offer({amount_tokens: amount, user: user})

    if(self.tokens[symbol_index].sellBook[priceWei].offers_len == 1): 
        self.tokens[symbol_index].sellBook[priceWei].offers_key = 1
        self.tokens[symbol_index].amount_sell_prices += 1 # New sell order received
        current_sell_price: wei_value = self.tokens[symbol_index].current_sell_price
        highest_sell_price: wei_value = self.tokens[symbol_index].highest_sell_price
        # sell offer is either First order or highest entry
        if(highest_sell_price == as_wei_value(0, 'ether') or highest_sell_price < priceWei):     
            if(current_sell_price == as_wei_value(0, 'ether')): # First entry, No orders exist
                self.tokens[symbol_index].current_sell_price = priceWei # Set current price to price offer
                self.tokens[symbol_index].sellBook[priceWei].highPrice = as_wei_value(0, 'ether') # Set higher price to first order
                self.tokens[symbol_index].sellBook[priceWei].lowPrice = as_wei_value(0, 'ether') # Set lower price to 0
            else: # New sell offer is highest entry lowPrice > priceWei
                self.tokens[symbol_index].sellBook[highest_sell_price].highPrice = priceWei # Set sell book highest price to New order price
                self.tokens[symbol_index].sellBook[priceWei].lowPrice = highest_sell_price
                self.tokens[symbol_index].sellBook[priceWei].highPrice = as_wei_value(0, 'ether')
            self.tokens[symbol_index].highest_sell_price = priceWei
        elif(current_sell_price > priceWei): # New sell offer is highest sell price
            self.tokens[symbol_index].sellBook[current_sell_price].lowPrice = priceWei
            self.tokens[symbol_index].sellBook[priceWei].highPrice = current_sell_price
            self.tokens[symbol_index].sellBook[priceWei].lowPrice = as_wei_value(0, 'ether')
            self.tokens[symbol_index].current_sell_price = priceWei
        else: # New sell offer is between existing highest and highest sell prices
            sellPrice: wei_value = self.tokens[symbol_index].current_sell_price
            foundInsert: bool = False
            for i in range(MAX_ORDERS):
                if(sellPrice < priceWei and self.tokens[symbol_index].sellBook[sellPrice].highPrice > priceWei):
                    self.tokens[symbol_index].sellBook[priceWei].lowPrice = sellPrice
                    self.tokens[symbol_index].sellBook[priceWei].highPrice = self.tokens[symbol_index].sellBook[sellPrice].highPrice
                    self.tokens[symbol_index].sellBook[self.tokens[symbol_index].sellBook[sellPrice].highPrice].lowPrice = priceWei # Set order books higher price entry low price to the new offer
                    self.tokens[symbol_index].sellBook[sellPrice].highPrice = priceWei # Set order book lower price entry higher price to the new order price
                    foundInsert = True # Higher sell price > offer price and Offer price > entry price
                sellPrice = self.tokens[symbol_index].sellBook[sellPrice].highPrice
                if(foundInsert):
                    break


@private
def createSellLimitOrderUnmatched(sender: address, symbol_name: string[64], symbol_index: int128, priceWei: wei_value, amount_tokens_required: uint256, total_eth_required: wei_value):
    """
    @notice - If a sell order is unmatched it will call this function
    """
    total_eth_available: wei_value = total_eth_required # Ether balance required to purchase token
    self.tokenBalances[sender][symbol_index] -= amount_tokens_required # Use exchange balance for new order
    self.addSellOffer(symbol_index, priceWei, amount_tokens_required, sender)
    log.NewLimitSellOrder(symbol_index, sender, amount_tokens_required, priceWei, self.tokens[symbol_index].sellBook[priceWei].offers_len)

# Order Book - ASK Orders
@public
def sellToken(symbol_name: string[64], priceWei: wei_value, amount: uint256):
    """
    @notice - Submit a New Bid Order
    """
    _symbolIndex: int128 = self.getSymbolIndex(symbol_name) # Gets symbol index in memory
    total_eth_required: wei_value = as_wei_value(0, 'ether')
    amount_tokens_required: uint256 = amount

    if(self.tokens[_symbolIndex].amount_buy_prices == 0 or self.tokens[_symbolIndex].current_buy_price < priceWei):
        #log.Error('Create Sell limit order for unmatched 1')
        self.createSellLimitOrderUnmatched(msg.sender, symbol_name, _symbolIndex, priceWei, amount_tokens_required, total_eth_required)
    else:
        # Execute market sell order
        # If: Buy Order Limit on book is greater than or equal to Sell priceWei offered by msg.sender
        total_eth_available: wei_value = as_wei_value(0, 'ether')
        whilePrice: wei_value = self.tokens[_symbolIndex].current_buy_price
        offers_key: uint256 = 0
        
        for i in range(MAX_ORDERS):
            if(whilePrice < priceWei or amount_tokens_required == 0):
                break
            offers_key = self.tokens[_symbolIndex].buyBook[whilePrice].offers_key
            for x in range(MAX_ORDERS):
                if(offers_key >= self.tokens[_symbolIndex].buyBook[whilePrice].offers_len or amount_tokens_required == 0):
                    break
                volume_price_address: uint256 = self.tokens[_symbolIndex].buyBook[whilePrice].offers[offers_key].amount_tokens
                if(volume_price_address <= amount_tokens_required):
                    total_eth_available = volume_price_address * whilePrice / self.decimals
                    assert self.tokenBalances[msg.sender][_symbolIndex] >= volume_price_address
                    self.tokenBalances[msg.sender][_symbolIndex] -= volume_price_address
                    self.tokenBalances[self.tokens[_symbolIndex].buyBook[whilePrice].offers[offers_key].user][_symbolIndex] += volume_price_address
                    self.tokens[_symbolIndex].buyBook[whilePrice].offers[offers_key].amount_tokens = 0
                    self.ethBalances[msg.sender] += total_eth_available
                    self.tokens[_symbolIndex].buyBook[whilePrice].offers_key += 1
                    log.FulfilledSellOrder(_symbolIndex, volume_price_address, whilePrice, offers_key)
                    amount_tokens_required -= volume_price_address
                else:
                    assert volume_price_address > amount_tokens_required
                    total_eth_required = amount_tokens_required * whilePrice / self.decimals
                    self.tokenBalances[msg.sender][_symbolIndex] -= amount_tokens_required
                    self.tokens[_symbolIndex].buyBook[whilePrice].offers[offers_key].amount_tokens -= amount_tokens_required
                    self.ethBalances[msg.sender] += total_eth_required
                    self.tokenBalances[self.tokens[_symbolIndex].buyBook[whilePrice].offers[offers_key].user][_symbolIndex] += amount_tokens_required
                    log.FulfilledSellOrder(_symbolIndex, amount_tokens_required, whilePrice, offers_key)
                    amount_tokens_required = 0
                if( offers_key == self.tokens[_symbolIndex].buyBook[whilePrice].offers_len and 
                    self.tokens[_symbolIndex].buyBook[whilePrice].offers[offers_key].amount_tokens == 0):
                    self.tokens[_symbolIndex].amount_buy_prices -= 1
                    if( whilePrice == self.tokens[_symbolIndex].buyBook[whilePrice].lowPrice or
                        self.tokens[_symbolIndex].buyBook[whilePrice].lowPrice == as_wei_value(0, 'ether')):
                        self.tokens[_symbolIndex].current_buy_price = as_wei_value(0, 'ether')
                    else:
                        self.tokens[_symbolIndex].current_buy_price = self.tokens[_symbolIndex].buyBook[whilePrice].lowPrice
                        self.tokens[_symbolIndex].buyBook[self.tokens[_symbolIndex].buyBook[whilePrice].lowPrice].highPrice = self.tokens[_symbolIndex].current_buy_price
                offers_key += 1
            whilePrice = self.tokens[_symbolIndex].current_buy_price
        if(amount_tokens_required > 0):
            # create Sell limit order for tokens unable to match with a sell order for a Seller
            #log.Error('Create Sell limit order for unmatched 2')
            self.createSellLimitOrderUnmatched(msg.sender, symbol_name, _symbolIndex, priceWei, amount_tokens_required, total_eth_required)


@public
def cancelOrder(symbol_name: string[64], isSellOrder: bool, priceWei: wei_value, offer_key: uint256):
    """
    @notice - Cancels a Limit Order
    """
    _symbolIndex: int128 = self.getSymbolIndex(symbol_name) # Gets symbol index in memory

    if(isSellOrder):
        assert self.tokens[_symbolIndex].sellBook[priceWei].offers[offer_key].user == msg.sender
        token_amount: uint256 = self.tokens[_symbolIndex].sellBook[priceWei].offers[offer_key].amount_tokens
        self.tokenBalances[msg.sender][_symbolIndex] += token_amount
        self.tokens[_symbolIndex].sellBook[priceWei].offers[offer_key].amount_tokens = 0
        log.CanceledSellOrder(_symbolIndex, priceWei, offer_key)
    else:
        assert self.tokens[_symbolIndex].sellBook[priceWei].offers[offer_key].user == msg.sender
        etherRefund: wei_value = self.tokens[_symbolIndex].buyBook[priceWei].offers[offer_key].amount_tokens * priceWei
        self.ethBalances[msg.sender] += etherRefund
        self.tokens[_symbolIndex].buyBook[priceWei].offers[offer_key].amount_tokens = 0
        log.CanceledBuyOrder(_symbolIndex, priceWei, offer_key)
