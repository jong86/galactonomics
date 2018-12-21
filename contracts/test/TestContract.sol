pragma solidity ^0.4.24;

import "../interfaces/ICommodityReg.sol";

/**
 * @dev This contract is used only in truffle tests
 */
contract TestContract {
  ICommodityReg commodityReg;

  constructor(address _commodityReg) public {
    commodityReg = ICommodityReg(_commodityReg);
  }

  /**
   * @dev This function is for testing the blocking flag of function submitPOW in CommodityReg.
   *  (that function should only be allowed to be called successfully once per block)
   */
  function trySubmitPOWTwice(uint _nonce, uint _commodityId) external {
    commodityReg.submitPOW(_nonce, _commodityId);
    commodityReg.submitPOW(_nonce, _commodityId);
  }
}