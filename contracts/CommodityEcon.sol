pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./interfaces/ICommodityReg.sol";

/**
 * @title CommodityEcon
 *
 * @notice The CommodityEcon handles commodity trading
 */
contract CommodityEcon {
  using SafeMath for uint;

  ICommodityReg commodityReg;

  struct SellOrder {
    address seller;
    uint amount;
    uint price;
    bool open;
    address buyer;
  }

  // Mapping of planetId to array containing the commodity Ids that are sold on that planet
  mapping(uint => uint[]) public planetIdToCommodityIdsTraded;

  // Mapping of planetId to commodityId to sell orders array
  mapping(uint => mapping(uint => SellOrder[])) public marketplaces;

  event sellOrderCreated(uint planetId, uint orderId);
  event sellOrderPurchased(uint planetId, uint orderId);

  constructor(address _commodityReg) {
    commodityReg = ICommodityReg(_commodityReg);
  }

  /**
   * @notice To sell a commodity on a planet
   * @param _commodityId ID of commodity to sell
   * @param _amount Quantity of commodity to sell
   * @param _price Price per unit of commodity
   */
  function createSellOrder(uint _planetId, uint _commodityId, uint _amount, uint _price) external {
    require(commodityReg.balanceOf(msg.sender, _commodityId) >= _amount, "You do not own enough of this commodity");

    // Arrange transfer of commodity from user to escrow
    SellOrder memory sellOrder = SellOrder(msg.sender, _amount, _price, true, address(0));
    commodityReg.transferToEscrow(msg.sender, _commodityId, _amount);
    // Store order in array
    uint _arrayLength = marketplaces[_planetId][_commodityId].push(sellOrder);
    uint _orderId = _arrayLength.sub(1);

    emit sellOrderCreated(_planetId, _orderId);
  }

  /**
   * @notice To purchase a commodity that is for sale
   * @param _planetId ID of planet that sell order is on
   * @param _commodityId ID of commodity to buy
   * @param _orderId ID of order to purchase
   */
  function buySellOrder(uint _planetId, uint _commodityId, uint _orderId) external payable {
    SellOrder memory sellOrder = marketplaces[_planetId][_commodityId][_orderId];
    require(msg.value == sellOrder.amount.mul(sellOrder.price), "You did not send the correct amount of ether");

    // Arrange transfer of commodity out of escrow
    commodityReg.transferFromEscrow(msg.sender, _commodityId, sellOrder.amount);
    // Transfer eth from buyer to seller
    sellOrder.seller.transfer(msg.value);
    // Close order
    marketplaces[_planetId][_commodityId][_orderId].open = false;
    // Add buyer's name to order for historical purposes
    marketplaces[_planetId][_commodityId][_orderId].buyer = msg.sender;

    emit sellOrderPurchased(_planetId, _orderId);
  }

  /**
   * @notice Returns all data on specified sell order
   * @param _planetId ID of planet that sell order is on
   * @param _commodityId ID of commodity being sold
   * @param _orderId ID of sell order
   */
  function getSellOrder(uint _planetId, uint _commodityId, uint _orderId) external view
  returns (
    address seller,
    uint amount,
    uint price,
    bool open,
    address buyer,
    uint orderId
  ) {
    SellOrder memory sellOrder = marketplaces[_planetId][_commodityId][_orderId];
    return (
      sellOrder.seller,
      sellOrder.amount,
      sellOrder.price,
      sellOrder.open,
      sellOrder.buyer,
      _orderId
    );
  }

  /**
   * @notice Returns the number of sell orders that exist for a specified planet and commodity
   * @param _planetId ID of planet that sell order is on
   * @param _commodityId ID of commodity being sold
   */
  function getNumSellOrders(uint _planetId, uint _commodityId) external view returns(uint) {
    return marketplaces[_planetId][_commodityId].length;
  }

  /**
   * @notice Returns an array containing the IDs of the commodoties sold on a particular planet
   * @param _planetId ID of planet that sell order is on
   */
  function getCommoditiesTraded(uint _planetId) external view returns (uint[] commoditiesTraded) {
    return planetIdToCommodityIdsTraded[_planetId];
  }
}
