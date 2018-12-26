pragma solidity ^0.4.24;

import "../interfaces/ICommodityInd.sol";

/**
 * @dev This contract is used only in truffle tests
 */
contract TestContract {
  ICommodityInd commodityInd;

  constructor(address _commodityInd) public {
    commodityInd = ICommodityInd(_commodityInd);
  }

  /**
   * @dev This function is for testing the blocking flag of function submitPOW in CommodityInd.
   *  (that function should only be allowed to be called successfully once per block)
   */
  function trySubmitPOWTwice(uint _nonce, uint _commodityId, uint _blockNumber) external {
    commodityInd.submitPOW(_nonce, _commodityId, _blockNumber);
    commodityInd.submitPOW(_nonce, _commodityId, _blockNumber);
  }
}