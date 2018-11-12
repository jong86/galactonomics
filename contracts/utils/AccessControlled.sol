pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @dev Extends contracts with identity setters and access-restriction modifiers
 */
contract AccessControlled is Ownable {
  address public geaAddress;
  address public giaAddress;
  address public taAddress;

  /**
   * @dev Access modifier for GEA-only functionality
   */
  modifier onlyGEA() {
    require(msg.sender == geaAddress, "Only the Galactic Economic Authority may access this function");
    _;
  }

  /**
   * @dev Access modifier for GEA-only functionality
   */
  modifier onlyGIA() {
    require(msg.sender == giaAddress, "Only the Galactic Industrial Authority may access this function");
    _;
  }

  /**
   * @dev Access modifier giving permission to both GEA and GIA
   */
  modifier onlyGEAOrGIA {
    require(
      msg.sender == geaAddress || msg.sender == giaAddress,
      "Only the Galactic Economic Authority or Galactic Industrial Authority may access this function"
    );
    _;
  }

  /**
   * @dev Access modifier for TA-only functionality
   */
  modifier onlyTA() {
    require(msg.sender == taAddress, "Only the Temple Authority may access this function");
    _;
  }

  /**
   * @dev Assigns address of the Galactic Economic Authority
   * @param _geaAddress Address of Galactic Economic Authority contract
   */
  function setGEA(address _geaAddress) public onlyOwner {
    require(_geaAddress != address(0), "New address cannot be zero address");

    geaAddress = _geaAddress;
  }

  /**
   * @dev Assigns address of the Galactic Industrial Authority
   * @param _giaAddress Address of Galactic Industrial Authority contract
   */
  function setGIA(address _giaAddress) public onlyOwner {
    require(_giaAddress != address(0), "New address cannot be zero address");

    giaAddress = _giaAddress;
  }

  /**
   * @dev Assigns address of the Temple Authority
   * @param _taAddress Address of Temple Authority contract
   */
  function setTA(address _taAddress) public onlyOwner {
    require(_taAddress != address(0), "New address cannot be zero address");

    taAddress = _taAddress;
  }
}