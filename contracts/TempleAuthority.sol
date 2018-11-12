pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Metadata.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./utils/AccessControlled.sol";
import "./utils/CommodityInteractor.sol";
import "./utils/GTAInteractor.sol";

/**
 * @title Temple Authority
 * @notice This contract handles Byzantian Crystal creation and trading
 */
contract TempleAuthority is ERC721Metadata, CommodityInteractor, GTAInteractor {
  using SafeMath for uint;

  uint public constant forgingAmount = 10000; // units of each commodity

  constructor(address[] _commodityAddresses, address _gta)
  ERC721Metadata("ByzantianCrystals", "BZC")
  CommodityInteractor(_commodityAddresses)
  GTAInteractor(_gta)
  public {}


  /**
   * @notice Creates a new crystal, requires forgingAmount in all 7 commodities
   * @return tokenId of newly created crystal
   */
  function forge() external onlyPlayer samePlanet(255) returns (uint) {
    // Check balance of every commodity to make sure there is enough
    for (uint i = 0; i <= 6; i++) {
      require(
        commodities[0]._interface.balanceOf(msg.sender) >= forgingAmount,
        "You do not have enough commodities to forge"
      );
    }

    // Burn x amount of all 7 of user's commodities


    // Mint one token for user


    // Set URI of token to something unique


  }

  /**
   * @notice Put a crystal up for sale
   * @param _tokenId Id of crystal to sell
   */
  function sell(uint _tokenId) external {

  }

  /**
   * @notice Purchase a crystal
   * @param _tokenId Id of crystal to purchase
   */
  function buy(uint _tokenId) external {

  }





  function() public {}
}
