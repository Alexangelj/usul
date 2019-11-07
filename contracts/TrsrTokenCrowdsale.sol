pragma solidity >=0.5.12 <0.6.0;


import './TrsrToken.sol';


contract TrsrTokenCrowdsale {
    // Using safe math operations to calculate conversion ether => tokens
    using SafeMath for uint256;

    // Name variables
    address payable administrator;
    uint256 public trsrPrice;
    uint256 public trsrSold;
    TrsrToken public trsrContract;

    // Function to initalize the sale
    constructor(TrsrToken _trsrContract, uint256 _trsrPrice) public {
        // Set admin as the contract creator
        administrator = msg.sender;

        // Set variables using function params
        trsrContract = _trsrContract;
        trsrPrice = _trsrPrice;
    }
    // Event to call when a sale happens
    event TokensPurchased(address _purchaser, uint256 _amount);

    // Function to purchase the tokens
    function purchaseTrsrToken(uint256 _amountTokens) public payable {
        // Need the payable value to equal the token price * number of tokens
        require(msg.value == trsrPrice.mul(_amountTokens), 'Value is not equal to the token amt * token price.');

        // Need the balance held in the contract to be greater than the purchased amount
        require(trsrContract.balanceOf(address(this)) >= _amountTokens, 'Token purchase amt greater than contract balance.');

        // Need to transfer the tokens
        require(trsrContract.transfer(msg.sender, _amountTokens), 'Tokens are not getting transferred successfully.');

        // Track the amount of tokens sold
        trsrSold += _amountTokens;

        // Call the TokensPurchased Event
        emit TokensPurchased(msg.sender, _amountTokens);
    }
    // Function to finalize the sale
    function finalizeSale() public {
        // Need the caller of this function to be admin
        require(msg.sender == administrator, 'Function caller not admin.');

        // Need to return the remaining tokens to the administrators wallet
        require(trsrContract.transfer(administrator, trsrContract.balanceOf(address(this))), 'Need to return balance to admin.');

        // Transfer balance into admin acc
        administrator.transfer(address(this).balance);
    }
}