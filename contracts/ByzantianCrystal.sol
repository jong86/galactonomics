pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./utils/AccessControlled.sol";

/**
 * @title Byzantian Crystal
 *
 * @notice Non-fungible ERC-721 tokens
 */
contract ByzantianCrystal is ERC721Full, AccessControlled {
  using SafeMath for uint;

  constructor()
  ERC721Full("ByzantianCrystals", "BZC")
  public {}

  function create() external {
    // _mint...
  }
}
