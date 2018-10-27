pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./CommodityInteractor.sol";
import "./GTAInteractor.sol";

contract GalacticIndustrialAuthority is Ownable, CommodityInteractor, GTAInteractor {
  using SafeMath for uint;

  event InvestmentMade(address from, uint8 commodityId, uint value);
  event CommodityMinted(address to, uint8 commodityId);
  event Log(uint x);

  constructor(address[] _commodityAddresses, address _gta)
  CommodityInteractor(_commodityAddresses)
  GTAInteractor(_gta) public {}


  // Action functions

  function investInProduction(uint8 _commodityId) external payable
  onlyPlayer
  canFitCargo(msg.sender, getMassOfTotalProductionReturns(_commodityId)) {
    emit InvestmentMade(msg.sender, _commodityId, msg.value);
  }

  function mintCommodityFor(uint8 _commodityId, address _for) external
  onlyOwner {
  // canFitCargo(_for, getMassOfOneProductionReturn(_commodityId)) {
    commodities[_commodityId]._interface.mint(_for, commodities[_commodityId].amountMinedPerBlock);
    gta.addCargo(_for, commodities[_commodityId].amountMinedPerBlock * commodities[_commodityId].mass);
  }


  // View functions

  function getMassOfTotalProductionReturns(uint _commodityId) public returns (uint) {
    return commodities[_commodityId].amountMinedPerBlock * commodities[_commodityId].mass * 12;
  }

  function getMassOfOneProductionReturn(uint _commodityId) public returns (uint) {
    emit Log(commodities[_commodityId].amountMinedPerBlock * commodities[_commodityId].mass);
    return commodities[_commodityId].amountMinedPerBlock * commodities[_commodityId].mass;
  }

  function() public {}
}
