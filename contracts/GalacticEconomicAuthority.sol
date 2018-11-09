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
    uint amount;
    uint price;
    bool open;
    address buyer;
  }

  mapping(uint8 => SellOrder[]) public marketplaces;

  event sellOrderCreated(uint8 planetId, uint orderId);
  event sellOrderPurchased(uint8 planetId, uint orderId);
  event Log(uint x);

  constructor(address[] _commodityAddresses, address _gta)
  CommodityInteractor(_commodityAddresses)
  GTAInteractor(_gta) public {}


  // Action functions

  function createSellOrder(uint8 _planetId, uint8 _commodityId, uint _amount, uint _price)
  external
  samePlanet(_planetId) {
    require(commodities[_commodityId]._interface.balanceOf(msg.sender) >= _amount, "You do not own enough of this commodity");
    // Arrange transfer of commodity from user to escrow
    SellOrder memory sellOrder = SellOrder(msg.sender, _commodityId, _amount, _price, true, address(0));
    commodities[_commodityId]._interface.transferForPlayer(msg.sender, address(this), _amount);
    uint _arrayLength = marketplaces[_planetId].push(sellOrder);
    uint _orderId = _arrayLength.sub(1);
    emit sellOrderCreated(_planetId, _orderId);
  }

  function buySellOrder(uint8 _planetId, uint _orderId) external payable
  onlyPlayer
  samePlanet(_planetId)
  canFitCargo(msg.sender, getCurrentCargo(msg.sender), marketplaces[_planetId][_orderId].amount) {
    SellOrder memory sellOrder = marketplaces[_planetId][_orderId];
    require(msg.value == sellOrder.amount.mul(sellOrder.price), "You did not send the correct amount of ether");
    // Arrange transfer of commodity out of escrow
    commodities[sellOrder.commodityId]._interface.transfer(msg.sender, sellOrder.amount);
    sellOrder.seller.transfer(msg.value);
    // Close order
    marketplaces[_planetId][_orderId].open = false;
    // Add buyer's name to order for historical purposes
    marketplaces[_planetId][_orderId].buyer = msg.sender;
    emit sellOrderPurchased(_planetId, _orderId);
  }


  // View functions

  function getSellOrder(uint8 _planetId, uint _orderId) external view
  returns (
    address seller,
    uint8 commodityId,
    uint amount,
    uint price,
    bool open,
    address buyer,
    uint orderId
  ) {
    SellOrder memory sellOrder = marketplaces[_planetId][_orderId];
    return (
      sellOrder.seller,
      sellOrder.commodityId,
      sellOrder.amount,
      sellOrder.price,
      sellOrder.open,
      sellOrder.buyer,
      _orderId
    );
  }

  function getNumSellOrders(uint8 _planetId) external view returns(uint) {
    return marketplaces[_planetId].length;
  }
}
