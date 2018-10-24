pragma solidity ^0.4.24;

import "./Commodity.sol";

contract CommodityInteractor {
  // How actual in-game commodity data is stored
  struct CommodityData {
    address addr;
    uint miningCost;
    uint amountMinedPerBlock;
  }

  CommodityData[7] commodities;

  constructor(address[] _commodities) {
    for (uint8 i = 0; i < commodities.length; i++) {
      commodities[i] = CommodityData(_commodities[i], 100, 364000);
    }
  }

  function mintCommodityFor(address _for, uint8 _commodityId) external onlyOwner returns (bool) {
    return true;
  }

  function getCommodity(uint8 _commodityId) external view returns (
    string,
    string,
    address,
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
      commodityData.amountMinedPerBlock
    );
  }
}
