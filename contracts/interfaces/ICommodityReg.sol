pragma solidity ^0.4.24;

/**
 * @title ICommodityReg
 */
contract ICommodityReg {
  function submitPOW(uint, uint) external {}
  function getCommodity(uint) external view returns (bytes32, uint, uint) {}
  function getURI(uint) public view returns (string) {}
  function getMiningReward(uint) public view returns (uint) {}
  function getMiningTarget(uint) public view returns (bytes32) {}

  function balanceOf(address, uint) public view returns (uint) {}
  function transferToEscrow(address, uint, uint) public returns (bool) {}
  function transferFromEscrow(address, uint, uint) public returns (bool) {}
  function _mint(address, uint, uint) private returns (bool) {}
  function burn(address, uint, uint) public view returns (bool) {}
}