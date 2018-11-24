pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./items/Commodity.sol";
import "./interfaces/ICommodity.sol";
import "./interfaces/ICommodities.sol";

/**
 * @title Commodities
 *
 * @notice This contracts holds all data on the commodities
 */
contract Commodities is ICommodities, Ownable {
  using SafeMath for uint;

  event LogAddr1(address addr);

  struct CommodityData {
    address addr;
    ICommodity _interface;
    uint miningAmount;
    bytes32 miningTarget;
  }

  // Array storing all info for each commodity
  CommodityData[7] public commodities;

  // Array storing all contracts of commodities
  Commodity[2] public contracts;

  constructor() public {
    contracts[0] = new Commodity("Iodine", "IOD");
    contracts[1] = new Commodity("Neon gas", "NEG");
    // contracts[2] = new Commodity("Iron ore", "IRN");
    // contracts[3] = new Commodity("Platinum ore", "PLT");
    // contracts[4] = new Commodity("Gold ore", "GLD");
    // contracts[5] = new Commodity("Petroleum", "PET");
    // contracts[6] = new Commodity("Water", "WTR");

    for (uint i = 0; i < contracts.length; i++) {
      LogAddr1(address(contracts[i]));
      commodities[i] = CommodityData(
        address(contracts[i]),
        ICommodity(address(contracts[i])),
        8000,
        bytes32(0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff)
      );
    }
  }

  function getCurrentCargo(address _player) external view returns (uint) {
    uint currentCargo;
    for (uint8 i = 0; i < commodities.length; i++) {
      uint cargoToAdd = commodities[i]._interface.balanceOf(_player);
      currentCargo = currentCargo.add(cargoToAdd);
    }
    return currentCargo;
  }

  function get(uint8 _id) external view returns (
    address addr,
    string name,
    string symbol,
    uint miningAmount,
    bytes32 miningTarget
  ) {
    return (
      commodities[_id].addr,
      commodities[_id]._interface.name(),
      commodities[_id]._interface.symbol(),
      commodities[_id].miningAmount,
      commodities[_id].miningTarget
    );
  }

  function getName(uint8 _id) external view returns (string) {
    return commodities[_id]._interface.name();
  }

  function getSymbol(uint8 _id) external view returns (string) {
    return commodities[_id]._interface.symbol();
  }

  function getMiningAmount(uint8 _id) external view returns (uint) {
    return commodities[_id].miningAmount;
  }

  function getMiningTarget(uint8 _id) external view returns (bytes32) {
    return commodities[_id].miningTarget;
  }

  function getBalance(uint8 _id) external view returns (uint) {
    return commodities[_id]._interface.balanceOf(msg.sender);
  }

  function getInterface(uint8 _id) external view returns (ICommodity) {
    return commodities[_id]._interface;
  }

  function getAddress(uint8 _id) external view returns (address) {
    return commodities[_id].addr;
  }

  function setAccessForAll(address _geaAddress, address _giaAddress, address _taAddress) external {
    for (uint i = 0; i < contracts.length; i++) {
      commodities[i]._interface.setGEA(_geaAddress);
      commodities[i]._interface.setGIA(_giaAddress);
      commodities[i]._interface.setTA(_taAddress);
    }
  }

  function() public {}
}
