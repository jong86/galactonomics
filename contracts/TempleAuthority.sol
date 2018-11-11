pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Metadata.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./utils/ControlledByGEAAndGIA.sol";
import "./utils/CommodityInteractor.sol";
import "./utils/GTAInteractor.sol";

/**
 * @title Temple Authority
 * @notice This contract handles Byzantian Crystal creation and trading
 */
contract TempleAuthority is ERC721Metadata, CommodityInteractor, GTAInteractor {
  using SafeMath for uint;

  constructor(address[] _commodityAddresses, address _gta)
  ERC721Metadata("ByzantianCrystals", "BZC")
  CommodityInteractor(_commodityAddresses)
  GTAInteractor(_gta)
  public {}


  /**
   * @notice Creates a new crystal, requires an amount of all 7 commodities
   */
  function forge(address _for) external {
    // Check balance of every commodity to make sure there is enough

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
