pragma solidity ^0.4.24;

contract GalacticEconomicAuthority {
  struct SellOrder {
    address seller;
    uint8 commodityId;
    uint amount;
    uint price;
  }

  mapping(uint8 => SellOrder[]) public planetMarketplaces;

  event sellOrderCreated(uint orderId);

  function createSellOrder(uint8 _planetId, uint8 _commodityId, uint _amount, uint _price) external {
    SellOrder memory sellOrder = SellOrder(msg.sender, _commodityId, _amount, _price);
    uint _orderId = planetMarketplaces[_planetId].push(sellOrder) - 1;
    emit sellOrderCreated(_orderId);

    // transfer commodity to this address
    
  }

  function getSellOrder(uint8 _planetId, uint _orderId) external view returns (address, uint8, uint, uint) {
    SellOrder memory sellOrder = planetMarketplaces[_planetId][_orderId];
    return (
      sellOrder.seller,
      sellOrder.commodityId,
      sellOrder.amount,
      sellOrder.price
    );
  }
}
