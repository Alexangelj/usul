const assert = require('assert').strict;

var _name = 'Emerald';
var _symbol = 'ECO';
var _decimals = 18;
var _totalSupply = 100000;

const ECOToken = artifacts.require('ECOToken');

contract('ECOToken', accounts => {
    

    it('Mints total supply upon deployment and gives it to administrator.', async () => {
        let instance = await ECOToken.deployed();
        let balance = await instance.totalSupply();
        let adminBalance = await instance.balanceOf(accounts[0]);
        assert.strictEqual(balance.toNumber(), _totalSupply, 'Must = 1,000,000.');
        assert.strictEqual(adminBalance.toNumber(), _totalSupply, 'Admin balance must equal supply balance on initialization');
    });


})