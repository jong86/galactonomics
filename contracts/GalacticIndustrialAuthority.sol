pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./CommodityInteractor.sol";
import "./GTAInteractor.sol";
import "./Commodity.sol";

contract GalacticIndustrialAuthority is Ownable, CommodityInteractor, GTAInteractor {
  using SafeMath for uint;

  struct Investment {
    uint amount;
    uint blocksLeft;
  }

  mapping(address => Investment) investments;

  event InvestmentMade(address from, uint8 commodityId, uint value);
  event CommodityMinted(address to, uint8 commodityId);
  event Log(uint x, uint y);

  constructor(address[] _commodityAddresses, address _gta)
  CommodityInteractor(_commodityAddresses)
  GTAInteractor(_gta) public {}


  // Action functions

  function investInProduction(uint8 _commodityId) external payable
  onlyPlayer
  samePlanet(_commodityId)
  // To prevent player from investing if they can't fit the cargo:
  canFitCargo(msg.sender, getCurrentCargo(msg.sender), getMassOfTotalProductionReturns(_commodityId)) {
    require(msg.value == getAmountRequired(_commodityId), "You have not provided enough ether");
    require(investments[msg.sender].blocksLeft == 0, "You can only mine one commodity at a time");

    investments[msg.sender] = Investment(msg.value, commodities[_commodityId].miningDuration);
    emit InvestmentMade(msg.sender, _commodityId, msg.value);
  }

  function mintCommodityFor(uint8 _commodityId, address _for) external onlyOwner {
    require(investments[_for].blocksLeft > 0, "There is no more blocks left to mine for this investment");
    investments[_for].blocksLeft = investments[_for].blocksLeft.sub(1);

    // Only mint what can fit on player's ship
    uint amountToMint = commodities[_commodityId].amountMinedPerBlock;
    uint availableCargo = gta.getAvailableCargo(_for, getCurrentCargo(_for));
    emit Log(amountToMint, availableCargo);
    if (amountToMint >= availableCargo) {
      amountToMint = availableCargo;
    }

    commodities[_commodityId]._interface.mint(_for, amountToMint);
  }


  // View functions

  function getMassOfTotalProductionReturns(uint8 _commodityId) public view returns (uint) {
    return commodities[_commodityId].amountMinedPerBlock.mul(
      commodities[_commodityId].mass * commodities[_commodityId].miningDuration
    );
  }

  function getMassOfOneProductionReturn(uint8 _commodityId) public view returns (uint) {
    return commodities[_commodityId].amountMinedPerBlock.mul(commodities[_commodityId].mass);
  }

  function getAmountRequired(uint8 _commodityId) public view returns (uint) {
    return commodities[_commodityId].miningCost;
  }

  function getInvestment(address _address) public view returns (uint, uint) {
    return (investments[_address].amount, investments[_address].blocksLeft);
  }

  function() public {}
}
