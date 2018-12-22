pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @dev Extends contracts with access-restriction modifiers and identity setters
 */
contract AccessControlled is Ownable {
  address public commodityEcon;
  address public commodityInd;
  address public crystalReg;

  /**
   * @dev Restricts access to address set as CommodityEcon
   */
  modifier onlyCommodityEcon() {
    require(msg.sender == commodityEcon, "Only CommodityEcon may access this function");
    _;
  }

  /**
   * @dev Restricts access to address set as CommodityInd
   */
  modifier onlyCommodityInd() {
    require(msg.sender == commodityInd, "Only CommodityInd may access this function");
    _;
  }

  /**
   * @dev Restricts access to address set as CrystalReg
   */
  modifier onlyCrystalReg() {
    require(msg.sender == crystalReg, "Only CrystalReg may access this function");
    _;
  }

  /**
   * @dev Assigns address of CommodityEcon
   * @param _commodityEcon Address of CommodityEcon contract
   */
  function setCommodityEcon(address _commodityEcon) public onlyOwner {
    require(_commodityEcon != address(0), "New address cannot be zero address");
    commodityEcon = _commodityEcon;
  }

  /**
   * @dev Assigns address of CommodityInd
   * @param _commodityInd Address of CommodityInd contract
   */
  function setCommodityInd(address _commodityInd) public onlyOwner {
    require(_commodityInd != address(0), "New address cannot be zero address");
    commodityInd = _commodityInd;
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