pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./items/Commodity.sol";
import "./interfaces/ICommodity.sol";
import "./interfaces/ICommodities.sol";

/**
 * @title Commodities
 *
 * @notice This contracts holds all data on the commodities
 */
contract Commodities is ICommodities {
  using SafeMath for uint;

  struct CommodityData {
    address addr;
    ICommodity _interface;
    uint miningCost;
    uint amountMinedPerBlock;
    uint miningDuration;
  }

  // Array storing all info for each commodity
  CommodityData[7] public commodities;

  constructor(address[] _commodityAddresses) public {
    for (uint8 i = 0; i < commodities.length; i++) {
      commodities[i] = CommodityData(
        _commodityAddresses[i],
        ICommodity(_commodityAddresses[i]),
        100,
        1000,
        8
      );
    }
  }

  function getCurrentCargo(address _player) external view returns (uint) {
    uint currentCargo;
    for (uint8 i = 0; i < commodities.length; i++) {
      uint cargoToAdd = commodities[i]._interface.balanceOf(_player);
      currentCargo = currentCargo.add(cargoToAdd);
    }
    return currentCargo;
  }

  function getCommodityInfo(uint8 _id) external view returns (string name, string symbol) {
    return (commodities[_id]._interface.name(), commodities[_id]._interface.symbol());
  }

  function getName(uint8 _id) external view returns (string) {
    return commodities[_id]._interface.name();
  }

  function getSymbol(uint8 _id) external view returns (string) {
    return commodities[_id]._interface.symbol();
  }

  function getMiningCost(uint8 _id) external view returns (uint) {
    return commodities[_id].miningCost;
  }

  function getAmountMinedPerBlock(uint8 _id) external view returns (uint) {
    return commodities[_id].amountMinedPerBlock;
  }

  function getMiningDuration(uint8 _id) external view returns (uint) {
    return commodities[_id].miningDuration;
  }

  function getBalance(uint8 _id) external view returns (uint) {
    return commodities[_id]._interface.balanceOf(msg.sender);
  }

  function getInterface(uint8 _id) external view returns (ICommodity) {
    return commodities[_id]._interface;
  }

  function() public {}
}
