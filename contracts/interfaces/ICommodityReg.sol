pragma solidity ^0.4.24;

/**
 * @title ICommodityReg
 */
contract ICommodityReg {
  function mint(address, uint, uint) external returns (bool) {}
  function burn(address, uint, uint) external returns (bool) {}
  function transferToEscrow(address, uint, uint) external returns (bool) {}
  function transferFromEscrow(address, uint, uint) external returns (bool) {}
  function balanceOf(address, uint) external view returns (uint) {}
}