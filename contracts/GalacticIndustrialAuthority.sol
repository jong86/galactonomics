pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Commodity.sol";
import "./CommodityInterface.sol";
import "./CommodityInteractor.sol";

contract GalacticIndustrialAuthority is Ownable, CommodityInteractor {
  event InvestmentMade(address from, uint8 commodityId, uint value);
  event CommodityMinted(address to, uint8 commodityId);

  constructor(address[] _commodityAddresses) CommodityInteractor(_commodityAddresses) {}

  function investInProduction(uint8 _commodityId) external payable {
    emit InvestmentMade(msg.sender, _commodityId, msg.value);
  }

  function mintCommodityFor(uint8 _commodityId, address _for) external onlyOwner {
    commodities[_commodityId]._interface.mint(_for, commodities[_commodityId].amountMinedPerBlock);
    emit CommodityMinted(_for, _commodityId);
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
