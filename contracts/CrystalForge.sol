pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./interfaces/ICrystal.sol";
import "./interfaces/ICommodityReg.sol";

/**
 * @title CrystalForge
 *
 * @notice This contract handles crystal forging
 */
contract CrystalForge {
  using SafeMath for uint;

  ICrystal crystal;
  ICommodityReg commodityReg;

  // Units of each commodity required to forge a crystal
  uint public constant forgingAmount = 42000;

  constructor(address _commodityReg, address _crystal) public {
    commodityReg = ICommodityReg(_commodityReg);
    crystal = ICrystal(_crystal);
  }

  event CrystalForged(string uri, address forger);

  event LogA(address a);

  /**
   * @notice Creates a new crystal, requires forgingAmount balance in all chosen commodities
   * @dev Burns a quantity of all chosen commodities
   * @return tokenId of newly created crystal
   */
  function forge(uint[] _crystalIds) external {
    uint i;

    // Check balance of every commodity to make sure there is enough
    uint length = _crystalIds.length;
    for (i = 0; i < length; i++) {
      require(
        commodityReg.balanceOf(msg.sender, _crystalIds[i]) >= forgingAmount,
        "You do not have enough commodities to forge"
      );
    }

    // Burn x amount of all user's chosen commodities
    for (i = 0; i < length; i++) {
      require(
        commodityReg.burn(msg.sender, _crystalIds[i], forgingAmount),
        "Error burning commodity"
      );
    }

    string memory _uri = crystal.create(msg.sender);

    emit CrystalForged(_uri, msg.sender);
  }

  function() external payable {}
}
