pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Commodity.sol";
import "./CommodityInterface.sol";
import "./CommodityInteractor.sol";

contract GalacticEconomicAuthority is Ownable, CommodityInteractor {
  struct SellOrder {
    address seller;
    uint8 commodityId;
    uint value;
    uint price;
  }

  mapping(uint8 => SellOrder[]) public planetMarketplaces;

  event sellOrderCreated(uint orderId);
  event Log(CommodityInterface);

  constructor(address[] _commodityAddresses) CommodityInteractor(_commodityAddresses) public {}

  function createSellOrder(uint8 _planetId, uint8 _commodityId, uint _value, uint _price) external {
    SellOrder memory sellOrder = SellOrder(msg.sender, _commodityId, _value, _price);
    uint _orderId = planetMarketplaces[_planetId].push(sellOrder) - 1;
    emit sellOrderCreated(_orderId);
    commodities[_commodityId]._interface.transferForPlayer(msg.sender, address(this), _value);
  }

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
