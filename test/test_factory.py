from pytest import raises
from web3.contract import ConciseContract
from eth_tester.exceptions import TransactionFailed

def test_factory(w3, account_template, factory, pad_bytes32, account_abi, assert_fail):
    a0, a1 = w3.eth.accounts[:2]
    with raises(TransactionFailed):
        factory.intializeFactory(user.address)