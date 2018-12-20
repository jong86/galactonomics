pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @dev Extends contracts with identity setters and access-restriction modifiers
 */
contract AccessControlled is Ownable {
  address public economicAuthority;
  address public crystalAuthority;

  /**
   * @dev Access modifier for Economic Authority-only functionality
   */
  modifier onlyEconomicAuthority() {
    require(msg.sender == economicAuthority, "Only the Economic Authority may access this function");
    _;
  }

  /**
   * @dev Access modifier for Crysal Authority-only functionality
   */
  modifier onlyCrystalAuthority() {
    require(msg.sender == crystalAuthority, "Only the Crystal Authority may access this function");
    _;
  }

  /**
   * @dev Assigns address of the Galactic Economic Authority
   * @param _economicAuthority Address of Galactic Economic Authority contract
   */
  function setEconomicAuthority(address _economicAuthority) public onlyOwner {
    require(_economicAuthority != address(0), "New address cannot be zero address");
    economicAuthority = _economicAuthority;
  }

  /**
   * @dev Assigns address of the Temple Authority
   * @param _crystalAuthority Address of Temple Authority contract
   */
  function setCrystalAuthority(address _crystalAuthority) public onlyOwner {
    require(_crystalAuthority != address(0), "New address cannot be zero address");
    crystalAuthority = _crystalAuthority;
  }
}