pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./interfaces/IGalacticTransitAuthority.sol";
import "./interfaces/ICommodities.sol";

/**
 * @title Galactic Economic Authority (GEA)
 *
 * @notice The GEA handles commodity trading
 */
contract GalacticEconomicAuthority {
  using SafeMath for uint;

  IGalacticTransitAuthority gta;
  ICommodities commodities;

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

  constructor(address _commodities, address _gta) {
    commodities = ICommodities(_commodities);
    gta = IGalacticTransitAuthority(_gta);

    // Arrays that set which commodities are available on each planet
    planetIdToCommodityIdsTraded[0] = [1, 4, 5];
    planetIdToCommodityIdsTraded[1] = [0, 2, 4, 6];
    planetIdToCommodityIdsTraded[2] = [3, 6];
    planetIdToCommodityIdsTraded[3] = [0, 2, 5];
    planetIdToCommodityIdsTraded[4] = [0, 1, 3];
    planetIdToCommodityIdsTraded[5] = [2, 6];
    planetIdToCommodityIdsTraded[6] = [1, 3, 4, 5];
  }

  /**
   * @dev Modifier that ensures a commodity ID is valid
   */
  modifier commodityExists(uint _commodityId) {
    require(0 <= _commodityId && _commodityId <= 6, "That commodity does not exist");
    _;
  }

  /**
   * @dev Modifier that ensures that a commodity is traded on a planet
   */
  modifier commodityTradedOnPlanet(uint _planetId, uint _commodityId) {
    uint length = planetIdToCommodityIdsTraded[_planetId].length;
    bool isTraded;
    for (uint i = 0; i < length; i++) {
      if (planetIdToCommodityIdsTraded[_planetId][i] == _commodityId) {
        isTraded = true;
        break;
      }
    }
    require(isTraded, "This commodity is not traded on this planet");
    _;
  }

  /**
   * @notice To sell a commodity on a planet
   * @param _planetId ID of planet to sell commodity on
   * @param _commodityId ID of commodity to sell
   * @param _amount Quantity of commodity to sell
   * @param _price Price per unit of commodity
   */
  function createSellOrder(uint _planetId, uint _commodityId, uint _amount, uint _price)
  external
  commodityExists(_commodityId)
  commodityTradedOnPlanet(_planetId, _commodityId) {
    require(gta.getCurrentPlanet(msg.sender) == _planetId, "You are not on the correct planet");
    require(commodities.balanceOf(msg.sender, _commodityId) >= _amount, "You do not own enough of this commodity");

    // Arrange transfer of commodity from user to escrow
    SellOrder memory sellOrder = SellOrder(msg.sender, _amount, _price, true, address(0));
    commodities.transferToEscrow(msg.sender, _commodityId, _amount);
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
  function buySellOrder(uint _planetId, uint _commodityId, uint _orderId) external payable
  commodityExists(_commodityId) {
    require(gta.isPlayer(msg.sender), "You must own a spaceship for this action");
    require(gta.getCurrentPlanet(msg.sender) == _planetId, "You are not on the correct planet");
    require(
      gta.canFitCargo(msg.sender, commodities.getCurrentCargo(msg.sender), marketplaces[_planetId][_commodityId][_orderId].amount),
      "Cannot fit this cargo on spaceship"
    );
    SellOrder memory sellOrder = marketplaces[_planetId][_commodityId][_orderId];
    require(msg.value == sellOrder.amount.mul(sellOrder.price), "You did not send the correct amount of ether");

    // Arrange transfer of commodity out of escrow
    commodities.transferFromEscrow(msg.sender, _commodityId, sellOrder.amount);
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
