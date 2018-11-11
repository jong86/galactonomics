pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./utils/ControlledByGEAAndGIA.sol";
import "./utils/CommodityInteractor.sol";

/**
 * @title Byzantian Crystals
 * @notice This contract handles B. Crystal creation and ownership
 */
contract ByzantianCrystals is ERC721, ControlledByGEAAndGIA, CommodityInteractor {
  using SafeMath for uint;

  


  /**
   * @notice Creates a new crystal, requires an amount of all 7 commodities
   */
  function forge() external onlyGIA {
    // Check balance of every commodity to make sure there is enough

  }

  /**
   * @notice Transfer ownership of a crystal
   */
  function transfer(address _to) external onlyGEA {

  }





  function() public {}
}
