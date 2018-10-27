pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Commodity.sol";
import "./CommodityInterface.sol";
import "./CommodityInteractor.sol";
import "./GalacticTransitAuthorityInterface.sol";

contract GalacticIndustrialAuthority is Ownable, CommodityInteractor {
  using SafeMath for uint;

  event InvestmentMade(address from, uint8 commodityId, uint value);
  event CommodityMinted(address to, uint8 commodityId);
  event Log(uint x);

  GalacticTransitAuthorityInterface gta;

  constructor(address[] _commodityAddresses, address _gta)
  CommodityInteractor(_commodityAddresses) public {
    gta = GalacticTransitAuthorityInterface(_gta);
  }

  modifier onlyPlayer() {
    require(gta.isPlayer(msg.sender), "You need to own a spaceship to call this function");
    _;
  }


  // Action functions

  function investInProduction(uint8 _commodityId) external payable onlyPlayer {
    emit InvestmentMade(msg.sender, _commodityId, msg.value);
  }

  function mintCommodityFor(uint8 _commodityId, address _for) external onlyOwner {
    commodities[_commodityId]._interface.mint(_for, commodities[_commodityId].amountMinedPerBlock);
    gta.addCargo(_for, commodities[_commodityId].amountMinedPerBlock * commodities[_commodityId].mass);
  }

  function() public {}
}
