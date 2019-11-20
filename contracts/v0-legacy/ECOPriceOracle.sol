pragma solidity 0.5.12;

interface AggregatorInterface {
  function currentAnswer() external view returns (int256);
  function updatedHeight() external view returns (uint256);
}

contract ECOPriceOracle {
  AggregatorInterface internal referenceAddress;

  constructor(address _aggregator) public {
    referenceAddress = AggregatorInterface(_aggregator);
  }

  function getLatestPrice() public view returns (int256) {
    return referenceAddress.currentAnswer();
  }

  function getLatestUpdateHeight() public view returns (uint256) {
    return referenceAddress.updatedHeight();
  }
}