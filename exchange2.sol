/////////////////////////////////
// NEW ORDER - ASK ORDER       //
/////////////////////////////////
// Market Sell Order Function
// User wants to Sell X-Coins @ Y-Price per coin
function sellToken(string symbolName, uint priceInWei, uint amount) public payable {
    // Obtain Symbol Index for given Symbol Name
    uint8 tokenNameIndex = getSymbolIndexOrThrow(symbolName);
    uint totalAmountOfEtherNecessary = 0;
    uint totalAmountOfEtherAvailable = 0;
    // Given `amount` Volume of tokens to find necessary to fulfill the current Sell Order
    uint amountOfTokensNecessary = amount;
    if (tokens[tokenNameIndex].amountBuyPrices == 0 || tokens[tokenNameIndex].curBuyPrice < priceInWei) {
        createSellLimitOrderForTokensUnableToMatchWithBuyOrderForSeller(symbolName, tokenNameIndex, priceInWei, amountOfTokensNecessary, totalAmountOfEtherNecessary);
    } else {
        // Execute Market Sell Order Immediately if:
        // - Existing Buy Limit Order exists that is greater than the Sell Price Offered by the function caller
        // Start with the Highest Buy Price (since Seller wants to exchange their tokens with the highest bidder)
        uint whilePrice = tokens[tokenNameIndex].curBuyPrice;
        uint offers_key;
        // Iterate through the Buy Book (Buy Offers Mapping) to Find "Highest" Buy Offer Prices 
        // (assign to Current Buy Price `whilePrice` each iteration) that are Higher than the Sell Offer
        // and whilst the Volume to find is not yet fulfilled.
        // Note: Since we are in the Sell Order `sellOrder` function we use the Buy Book
        while (whilePrice >= priceInWei && amountOfTokensNecessary > 0) {
            offers_key = tokens[tokenNameIndex].buyBook[whilePrice].offers_key;
            // Inner While - Iterate Buy Book (Buy Offers Mapping) Entries for the Current Buy Price using FIFO
            while (offers_key <= tokens[tokenNameIndex].buyBook[whilePrice].offers_length && amountOfTokensNecessary > 0) {
                uint volumeAtPriceFromAddress = tokens[tokenNameIndex].buyBook[whilePrice].offers[offers_key].amountTokens;
                // Case when Current Buy Order Entry Volume Only Partially fulfills the Sell Order Volume
                // (i.e. Sell Order wants to sell more than Current Buy Order Entry requires)
                // then we achieve Partial exchange from Sell Order to the Buy Order Entry and then
                // move to Next Address with a Buy Order Entry at the Current Buy Price for the symbolName
                // i.e. Sell Order amount is for 1000 tokens but Current Buy Order is for 500 tokens at Current Buy Price 
                if (volumeAtPriceFromAddress <= amountOfTokensNecessary) {
                    // Amount of Ether available to be exchanged in the Current Buy Book Offers Entry at the Current Buy Price 
                    totalAmountOfEtherAvailable = volumeAtPriceFromAddress * whilePrice;
                    // Overflow Check
                    require(tokenBalanceForAddress[msg.sender][tokenNameIndex] >= volumeAtPriceFromAddress);
                    
                    // Decrease the Seller's Account Balance of tokens by the amount the Buy Offer Order Entry is willing to accept in exchange for ETH
                    tokenBalanceForAddress[msg.sender][tokenNameIndex] -= volumeAtPriceFromAddress;
                    // Overflow Checks
                    // - Assuming the Seller sells a proportion of their `symbolName` tokens in their Sell Offer 
                    //   to the Current Buy Order Entry that is requesting `volumeAtPriceFromAddress` then we need to first
                    //   check that the Sellers account has sufficient Volumne of those tokens to execute the trade
                    require(tokenBalanceForAddress[msg.sender][tokenNameIndex] - volumeAtPriceFromAddress >= 0);
                    // - Check that fulfilling the Current Buy Order Entry by adding the amount of tokens sold by the Sell Offer does not overflow 
                    require(tokenBalanceForAddress[tokens[tokenNameIndex].buyBook[whilePrice].offers[offers_key].who][tokenNameIndex] + volumeAtPriceFromAddress >= tokenBalanceForAddress[tokens[tokenNameIndex].buyBook[whilePrice].offers[offers_key].who][tokenNameIndex]);
                    // - Check that fulfilling the Current Buy Order Entry increases the Seller's ETH balance without overflowing 
                    require(balanceEthForAddress[msg.sender] + totalAmountOfEtherAvailable >= balanceEthForAddress[msg.sender]);
                    // Increase the Buyer's Account Balance of tokens (for the matching Buy Order Entry) with the proportion tokens required from the Sell Order
                    // (given that the Buy Offer originator is offering less or equal to the volume of the Sell Offer)
                    tokenBalanceForAddress[tokens[tokenNameIndex].buyBook[whilePrice].offers[offers_key].who][tokenNameIndex] += volumeAtPriceFromAddress;
                    // Reset the amount of ETH offered by the Current Buy Order Entry to zero 0
                    tokens[tokenNameIndex].buyBook[whilePrice].offers[offers_key].amountTokens = 0;
                    // Increase the Seller's Account Balance of ETH with all the ETH offered by the Current Buy Order Entry (in exchange for the Seller's token offering)
                    balanceEthForAddress[msg.sender] += totalAmountOfEtherAvailable;
                    // Move up one element in the Buy Book Offers Mapping (i.e. to the Next Buy Offer at the Current Buy Order Price)
                    tokens[tokenNameIndex].buyBook[whilePrice].offers_key++;
                    // Emit Event
                    SellOrderFulfilled(tokenNameIndex, volumeAtPriceFromAddress, whilePrice, offers_key);
                    // Decrease the amount necessary to be sold from the Seller's Offer by the amount of of tokens just exchanged for ETH with the Buyer at the Current Buy Order Price
                    amountOfTokensNecessary -= volumeAtPriceFromAddress;
                // Case when Sell Order Volume Only Partially fulfills the Current Buy Order Entry Volume 
                // (i.e. Sell Order wants to sell more than the Current Buy Order Entry needs)
                // then we achieve Partial exchange from Sell Order to the Buy Order Entry and then exit
                // i.e. Sell Order amount is for 500 tokens and Current Buy Order is for 1000 tokens at Current Buy Price 
                } else {
                    // Check that the equivalent value in tokens of the Buy Offer Order Entry is actually more than Sell Offer Volume 
                    require(volumeAtPriceFromAddress - amountOfTokensNecessary > 0);
                    // Calculate amount in ETH necessary to buy the Seller's tokens based on the Current Buy Price
                    totalAmountOfEtherNecessary = amountOfTokensNecessary * whilePrice;
                    // Overflow Check
                    require(tokenBalanceForAddress[msg.sender][tokenNameIndex] >= amountOfTokensNecessary);
                    // Decrease the Seller's Account Balance of tokens by amount they are offering since the Buy Offer Order Entry is willing to accept it all in exchange for ETH
                    tokenBalanceForAddress[msg.sender][tokenNameIndex] -= amountOfTokensNecessary;
                    // Overflow Check
                    require(tokenBalanceForAddress[msg.sender][tokenNameIndex] >= amountOfTokensNecessary);
                    require(balanceEthForAddress[msg.sender] + totalAmountOfEtherNecessary >= balanceEthForAddress[msg.sender]);
                    require(tokenBalanceForAddress[tokens[tokenNameIndex].buyBook[whilePrice].offers[offers_key].who][tokenNameIndex] + amountOfTokensNecessary >= tokenBalanceForAddress[tokens[tokenNameIndex].buyBook[whilePrice].offers[offers_key].who][tokenNameIndex]);
                    // Decrease the Buy Offer Order Entry amount by the full amount necessary to be sold by the Sell Offer
                    tokens[tokenNameIndex].buyBook[whilePrice].offers[offers_key].amountTokens -= amountOfTokensNecessary;
                    // Increase the Seller's Account Balance of ETH with the equivalent ETH amount corresponding to that offered by the Current Buy Order Entry (in exchange for the Seller's token offering)
                    balanceEthForAddress[msg.sender] += totalAmountOfEtherNecessary;
                    // Increase the Buyer's Account Balance of tokens (for the matching Buy Order Entry) with all the tokens sold by the Sell Order
                    tokenBalanceForAddress[tokens[tokenNameIndex].buyBook[whilePrice].offers[offers_key].who][tokenNameIndex] += amountOfTokensNecessary;
                    // Emit Event
                    SellOrderFulfilled(tokenNameIndex, amountOfTokensNecessary, whilePrice, offers_key);
                    // Set the remaining amount necessary to be sold by the Sell Order to zero 0 since we have fulfilled the Sell Offer
                    amountOfTokensNecessary = 0;
                }
                // Case when the Current Buy Offer is the last element in the list for the Current Buy Order Offer Price
                // and when we have exhausted exchanging the Sell Order's amount with Offers at the Current Buy Offer Price
                // then Move to the Next Highest Buy Order Offer Price in the Buy Book
                if (
                    offers_key == tokens[tokenNameIndex].buyBook[whilePrice].offers_length &&
                    tokens[tokenNameIndex].buyBook[whilePrice].offers[offers_key].amountTokens == 0
                ) {
                    // Decrease the quantity of Buy Order Prices since we used up the entire volume of all the Buy Offers at that price 
                    tokens[tokenNameIndex].amountBuyPrices--;
                    if (whilePrice == tokens[tokenNameIndex].buyBook[whilePrice].lowerPrice || tokens[tokenNameIndex].buyBook[whilePrice].lowerPrice == 0) {
                        // Case when no more Buy Book Offers to iterate through for the Current Buy Price (Last element of Linked List) 
                        // then set Current Buy Price to zero 0
                        tokens[tokenNameIndex].curBuyPrice = 0;
                    } else {
                        // REFERENCE "A"
                        // Case when not yet fulfilled `amountOfTokensNecessary` Volume of Sell Offer then
                        // set Proposed Current Buy Price to the Next Lower Buy Price in the Linked List
                        // so we move to the Next Lowest Entry in the Buy Book Offers Linked List
                        tokens[tokenNameIndex].curBuyPrice = tokens[tokenNameIndex].buyBook[whilePrice].lowerPrice;
                        // Set the Higher Price of the Next Lowest Entry that we moved to, to the Current Buy Order Offer Price
                        tokens[tokenNameIndex].buyBook[tokens[tokenNameIndex].buyBook[whilePrice].lowerPrice].higherPrice = tokens[tokenNameIndex].curBuyPrice;
                    }
                }
                offers_key++;
            }
            // After Finishing an Iteration of an Entry in the Buy Book Offers (until exhausted all Buy Book Offers for the previous Current Buy Price)
            // and setting the Proposed Current Buy Price to the Next Lowest Buy Price in REFERENCE "A".
            // Move to the Next Lowest Buy Price to be Iterated over by setting the Current Buy Price `whilePrice`
            whilePrice = tokens[tokenNameIndex].curBuyPrice;
        }
        // Case when unable to find a suitable Buy Order Offer to perform an exchange with the Seller's tokens 
        if (amountOfTokensNecessary > 0) {
            // Add a Sell Limit Order to the Sell Book since could not find a Market Order to exchange Seller's tokens immediately
            createSellLimitOrderForTokensUnableToMatchWithBuyOrderForSeller(symbolName, tokenNameIndex, priceInWei, amountOfTokensNecessary, totalAmountOfEtherNecessary);
        }
    }
}