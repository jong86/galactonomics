pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @dev Extends contracts with identity setters and access-restriction modifiers
 */
contract AccessControlled is Ownable {
  address public commodityEcon;
  address public crystalReg;

  /**
   * @dev Access modifier for Economic Authority-only functionality
   */
  modifier onlyCommodityEcon() {
    require(msg.sender == commodityEcon, "Only CommodityEcon may access this function");
    _;
  }

  /**
   * @dev Access modifier for Crysal Authority-only functionality
   */
  modifier onlyCrystalReg() {
    require(msg.sender == crystalReg, "Only CrystalReg may access this function");
    _;
  }

  /**
   * @dev Assigns address of the Galactic Economic Authority
   * @param _commodityEcon Address of Galactic Economic Authority contract
   */
  function setCommodityEcon(address _commodityEcon) public onlyOwner {
    require(_commodityEcon != address(0), "New address cannot be zero address");
    commodityEcon = _commodityEcon;
  }

  /**
   * @dev Assigns address of the Temple Authority
   * @param _crystalReg Address of Temple Authority contract
   */
  function setCrystalReg(address _crystalReg) public onlyOwner {
    require(_crystalReg != address(0), "New address cannot be zero address");
    crystalReg = _crystalReg;
  }
}