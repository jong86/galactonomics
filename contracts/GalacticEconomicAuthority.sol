pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./CommodityInteractor.sol";
import "./GalacticTransitAuthorityInterface.sol";

contract GalacticEconomicAuthority is Ownable, CommodityInteractor {
  struct SellOrder {
    address seller;
    uint8 commodityId;
    uint value;
    uint price;
    // bool open;
    // address buyer;
  }

  mapping(uint8 => SellOrder[]) public planetMarketplaces;

  event sellOrderCreated(uint8 planetId, uint orderId);
  event sellOrderPurchased(uint8 planetId, uint orderId);
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

  function createSellOrder(uint8 _planetId, uint8 _commodityId, uint _value, uint _price) external {
    require(commodities[_commodityId]._interface.balanceOf(msg.sender) > 0, "You do not own any of this commodity");
    SellOrder memory sellOrder = SellOrder(msg.sender, _commodityId, _value, _price);
    uint _orderId = planetMarketplaces[_planetId].push(sellOrder) - 1;
    commodities[_commodityId]._interface.transferForPlayer(msg.sender, address(this), _value);
    // Adjust current cargo
    emit sellOrderCreated(_planetId, _orderId);
  }

  function buySellOrder(uint8 _planetId, uint _orderId) external payable onlyPlayer {
    require(_planetId == gta.getCurrentPlanet(msg.sender), "You are not on the same planet as the order");
    SellOrder memory order = planetMarketplaces[_planetId][_orderId];
    require(msg.value == order.value * order.price, "You did not send the correct amount of ether");
    commodities[order.commodityId]._interface.transfer(msg.sender, order.value);
    order.seller.transfer(msg.value);
    // Adjust current cargo
    emit sellOrderPurchased(_planetId, _orderId);
  }


  // View functions

  function getSellOrder(uint8 _planetId, uint _orderId) external view returns (address, uint8, uint, uint) {
    SellOrder memory sellOrder = planetMarketplaces[_planetId][_orderId];
    return (
      sellOrder.seller,
      sellOrder.commodityId,
      sellOrder.value,
      sellOrder.price
    );
  }
}
