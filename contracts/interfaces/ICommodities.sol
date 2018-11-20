pragma solidity ^0.4.24;
import "./ICommodity.sol";

/**
 * @title ICommodities
 */
contract ICommodities {
  function getCurrentCargo(address _player) external view returns (uint) {}

  function getCommodityInfo(uint8 _id) external view returns (string name, string symbol) {}

  function getMiningCost(uint8 _id) external view returns (uint) {}

  function getAmountMinedPerBlock(uint8 _id) external view returns (uint) {}

  function getMiningDuration(uint8 _id) external view returns (uint) {}

  function getBalance(uint8 _id) external view returns (uint) {}

  function getInterface(uint8 _id) external view returns (ICommodity) {}
}