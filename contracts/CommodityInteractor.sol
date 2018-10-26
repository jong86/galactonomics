pragma solidity ^0.4.24;

contract CommodityInteractor {
  struct CommodityData {
    address addr;
    uint miningCost;
    uint amountMinedPerBlock;
  }

  CommodityData[7] public commodities;

  constructor(address[] _commodityAddresses) public {
    for (uint8 i = 0; i < commodities.length; i++) {
      commodities[i] = CommodityData(_commodityAddresses[i], 100, 364000);
    }
  }
}