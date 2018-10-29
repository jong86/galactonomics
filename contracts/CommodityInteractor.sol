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
  }

  CommodityData[7] public commodities;

  constructor(address[] _commodityAddresses) public {
    for (uint8 i = 0; i < commodities.length; i++) {
      commodities[i] = CommodityData(
        _commodityAddresses[i],
        CommodityInterface(_commodityAddresses[i]),
        100,
        1000,
        2
      );
    }
  }


  // View functions

  function getCommodity(uint8 _commodityId) external view returns (
    string,
    string,
    address,
    uint,
    uint,
    uint
  ) {
    CommodityData memory commodityData = commodities[_commodityId];
    Commodity commodity = Commodity(commodityData.addr);
    return (
      commodity.name(),
      commodity.symbol(),
      commodityData.addr,
      commodityData.miningCost,
      commodityData.amountMinedPerBlock,
      commodityData.mass
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
}