pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./CommodityInteractor.sol";
import "./GTAInteractor.sol";

contract GalacticIndustrialAuthority is Ownable, CommodityInteractor, GTAInteractor {
  using SafeMath for uint;

  uint8 public constant blocksToProduceFor = 12;

  event InvestmentMade(address from, uint8 commodityId, uint value);
  event CommodityMinted(address to, uint8 commodityId);
  event Log(uint x);

  constructor(address[] _commodityAddresses, address _gta)
  CommodityInteractor(_commodityAddresses)
  GTAInteractor(_gta) public {}


  // Action functions

  function investInProduction(uint8 _commodityId) external payable
  onlyPlayer
  samePlanet(_commodityId)
  canFitCargo(msg.sender, getMassOfTotalProductionReturns(_commodityId)) {
    // Check investment amount
    require(
      msg.value == getRequiredInvestment(_commodityId),
      "You have not provided enough ether"
    );
    emit InvestmentMade(msg.sender, _commodityId, msg.value);
  }

  function mintCommodityFor(uint8 _commodityId, address _for) external
  onlyOwner {
  // canFitCargo(_for, getMassOfOneProductionReturn(_commodityId)) {
    gta.addCargo(_for, commodities[_commodityId].amountMinedPerBlock * commodities[_commodityId].mass);
    commodities[_commodityId]._interface.mint(_for, commodities[_commodityId].amountMinedPerBlock);
  }


  // Private helpers

  function getMassOfTotalProductionReturns(uint8 _commodityId) private returns (uint) {
    return commodities[_commodityId].amountMinedPerBlock * commodities[_commodityId].mass * blocksToProduceFor;
  }

  function getMassOfOneProductionReturn(uint8 _commodityId) private returns (uint) {
    return commodities[_commodityId].amountMinedPerBlock * commodities[_commodityId].mass;
  }


  // View functions

  function getRequiredInvestment(uint8 _commodityId) public view returns (uint) {
    return commodities[_commodityId].miningCost * blocksToProduceFor;
  }

  function() public {}
}
