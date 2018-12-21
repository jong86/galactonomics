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

  // Mapping of commodityId to sell orders array
  mapping(uint => SellOrder[]) public markets;

  event SellOrderCreated(uint commodityId, uint orderId);
  event SellOrderPurchased(uint commodityId, uint orderId);

  constructor(address _commodityReg) {
    commodityReg = ICommodityReg(_commodityReg);
  }

  /**
   * @notice Create a sell order
   * @param _commodityId ID of commodity to sell
   * @param _amount Quantity of commodity to sell
   * @param _price Price per unit of commodity
   */
  function createSellOrder(uint _commodityId, uint _amount, uint _price) external {
    require(commodityReg.balanceOf(msg.sender, _commodityId) >= _amount, "You do not own enough of this commodity");

    // Arrange transfer of commodity from user to escrow
    SellOrder memory sellOrder = SellOrder(msg.sender, _amount, _price, true, address(0));
    require(commodityReg.transferToEscrow(msg.sender, _commodityId, _amount), "Error transferring to escrow");

    // Store order in array of all sell orders
    uint _arrayLength = markets[_commodityId].push(sellOrder);
    uint _orderId = _arrayLength.sub(1);

    // Store orderId in array for user


    emit SellOrderCreated(_commodityId, _orderId);
  }

  /**
   * @notice To purchase a commodity that is for sale
   * @param _commodityId ID of commodity to buy
   * @param _orderId ID of order to purchase
   */
  function buySellOrder(uint _commodityId, uint _orderId) external payable {
    SellOrder memory sellOrder = markets[_commodityId][_orderId];
    require(msg.value == sellOrder.amount.mul(sellOrder.price), "You did not send the correct amount of ether");

    // Arrange transfer of commodity out of escrow
    commodityReg.transferFromEscrow(msg.sender, _commodityId, sellOrder.amount);
    // Transfer eth from buyer to seller
    sellOrder.seller.transfer(msg.value);
    // Close order
    markets[_commodityId][_orderId].open = false;
    // Add buyer's name to order for historical purposes
    markets[_commodityId][_orderId].buyer = msg.sender;

    emit SellOrderPurchased(_commodityId, _orderId);
  }

  /**
   * @notice Returns all data on a specified sell order
   * @param _commodityId ID of commodity being sold
   * @param _orderId ID of sell order
   */
  function getSellOrder(uint _commodityId, uint _orderId) external view
  returns (
    address seller,
    uint amount,
    uint price,
    bool open,
    address buyer,
    uint orderId
  ) {
    SellOrder memory sellOrder = markets[_commodityId][_orderId];
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
   * @notice Returns the number of sell orders that exist for a commodity
   * @param _commodityId ID of commodity being sold
   */
  function getNumSellOrders(uint _commodityId) external view returns(uint) {
    return markets[_commodityId].length;
  }
}
