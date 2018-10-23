pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Commodity.sol";

contract GalacticIndustrialAuthority is Ownable {
  struct CommodityData {
    string name;
    address addr;
    uint miningCost;
    uint amountMinedPerBlock;
  }

  CommodityData[7] commodities;

  constructor() {
    // Deploy commodity contracts here
  }

  function mintCommodityFor(address _for, uint8 _commodityId) external onlyOwner returns (bool) {
    return true;
  }

  function getCommodities() external view returns (CommodityData[7]) {
    return commodities;
  }
}
