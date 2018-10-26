pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Commodity.sol";

contract CommodityInterface {
  function mint(address to, uint256 value) public returns (bool) {}
}

contract GalacticIndustrialAuthority is Ownable {
  // How actual in-game commodity data is stored
  struct CommodityData {
    address addr;
    uint miningCost;
    uint amountMinedPerBlock;
  }

  event InvestmentMade(address from, uint8 commodityId, uint value);
  event Log(string str);

  CommodityData[7] commodities;

  constructor(address[] _commodityAddresses) public {
    for (uint8 i = 0; i < commodities.length; i++) {
      commodities[i] = CommodityData(_commodityAddresses[i], 100, 364000);
    }
  }

  function investInProduction(uint8 _commodityId) external payable {
    emit InvestmentMade(msg.sender, _commodityId, msg.value);
  }

  function mintCommodityFor(uint8 _commodityId, address _for) external onlyOwner {
    CommodityInterface commodity = CommodityInterface(commodities[_commodityId].addr);
    commodity.mint(_for, commodities[_commodityId].amountMinedPerBlock);
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

  function() public {}
}
