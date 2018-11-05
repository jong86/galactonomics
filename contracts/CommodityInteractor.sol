pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Commodity.sol";
import "./CommodityInterface.sol";

contract CommodityInteractor {
  using SafeMath for uint;

  struct CommodityData {
    address addr;
    CommodityInterface _interface;
    uint miningCost;
    uint amountMinedPerBlock;
    uint mass;
    uint miningDuration;
  }

  CommodityData[7] public commodities;

  constructor(address[] _commodityAddresses) public {
    for (uint8 i = 0; i < commodities.length; i++) {
      commodities[i] = CommodityData(
        _commodityAddresses[i],
        CommodityInterface(_commodityAddresses[i]),
        100,
        1000,
        2,
        8
      );
    }
  }


  // View functions

  function getCommodity(uint8 _commodityId) external view returns (
    string name,
    string symbol,
    address addr,
    uint miningCost,
    uint amountMinedPerBlock,
    uint mass,
    uint miningDuration
  ) {
    CommodityData memory commodityData = commodities[_commodityId];
    Commodity commodity = Commodity(commodityData.addr);
    return (
      commodity.name(),
      commodity.symbol(),
      commodityData.addr,
      commodityData.miningCost,
      commodityData.amountMinedPerBlock,
      commodityData.mass,
      commodityData.miningDuration
    );
  }

  function getCurrentCargo(address _player) public view returns (uint) {
    uint currentCargo;

    for (uint8 i = 0; i < commodities.length; i++) {
      uint cargoToAdd = commodities[i].mass.mul(commodities[i]._interface.balanceOf(_player));
      currentCargo = currentCargo.add(cargoToAdd);
    }

    return currentCargo;
  }

  function getCommoditiesList() external view returns (
    string,
    string,
    string,
    string,
    string,
    string,
    string
  ) {
    return (
      commodities[0]._interface.name(),
      commodities[1]._interface.name(),
      commodities[2]._interface.name(),
      commodities[3]._interface.name(),
      commodities[4]._interface.name(),
      commodities[5]._interface.name(),
      commodities[6]._interface.name()
    );
  }
}