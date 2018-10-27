pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./CommodityInteractor.sol";
import "./GTAInteractor.sol";

contract GalacticEconomicAuthority is Ownable, CommodityInteractor, GTAInteractor {
  using SafeMath for uint;

  struct SellOrder {
    address seller;
    uint8 commodityId;
    uint value;
    uint price;
    bool open;
    address buyer;
  }

  mapping(uint8 => SellOrder[]) public planetMarketplaces;

  event sellOrderCreated(uint8 planetId, uint orderId);
  event sellOrderPurchased(uint8 planetId, uint orderId);
  event Log(uint x);

  constructor(address[] _commodityAddresses, address _gta)
  CommodityInteractor(_commodityAddresses)
  GTAInteractor(_gta) public {}


  // Action functions

  function createSellOrder(uint8 _planetId, uint8 _commodityId, uint _value, uint _price) external {
    require(commodities[_commodityId]._interface.balanceOf(msg.sender) > 0, "You do not own any of this commodity");
    SellOrder memory sellOrder = SellOrder(msg.sender, _commodityId, _value, _price, true, address(0));
    uint _orderId = planetMarketplaces[_planetId].push(sellOrder) - 1;
    commodities[_commodityId]._interface.transferForPlayer(msg.sender, address(this), _value);
    gta.removeCargo(msg.sender, _value * commodities[_commodityId].mass);

    emit sellOrderCreated(_planetId, _orderId);
  }

  function buySellOrder(uint8 _planetId, uint _orderId) external payable onlyPlayer {
    require(_planetId == gta.getCurrentPlanet(msg.sender), "You are not on the same planet as the order");
    SellOrder storage order = planetMarketplaces[_planetId][_orderId];
    require(msg.value == order.value * order.price, "You did not send the correct amount of ether");
    commodities[order.commodityId]._interface.transfer(msg.sender, order.value);
    order.seller.transfer(msg.value);
    // Adjust current cargo
    gta.addCargo(msg.sender, order.value * commodities[order.commodityId].mass);

    // Close order
    planetMarketplaces[_planetId][_orderId].open = false;

    // Add buyer's name to order for historical purposes
    planetMarketplaces[_planetId][_orderId].buyer = msg.sender;

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
