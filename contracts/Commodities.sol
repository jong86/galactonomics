pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./items/Commodity.sol";
import "./interfaces/ICommodity.sol";
import "./interfaces/ICommodities.sol";

/**
 * @title Commodities
 *
 * @notice This contracts is for convenient access to the commodities
 */
contract Commodities is ICommodities, Ownable {
  using SafeMath for uint;

  // Array storing all info for each commodity
  ICommodity[7] public commodities;

  constructor(address[] _commodities) public {
    for (uint i = 0; i < _commodities.length; i++) {
      commodities[i] = ICommodity(_commodities[i]);
    }
  }

  function getCurrentCargo(address _player) external view returns (uint) {
    uint currentCargo;
    for (uint8 i = 0; i < commodities.length; i++) {
      uint cargoToAdd = commodities[i].balanceOf(_player);
      currentCargo = currentCargo.add(cargoToAdd);
    }
    return currentCargo;
  }

  function get(uint8 _id) external view returns (
    string name,
    string symbol,
    uint miningReward,
    bytes32 miningTarget,
    bytes32 prevMiningHash
  ) {
    return (
      commodities[_id].name(),
      commodities[_id].symbol(),
      commodities[_id].miningReward(),
      commodities[_id].miningTarget(),
      commodities[_id].prevMiningHash()
    );
  }

  function getName(uint8 _id) external view returns (string) {
    return commodities[_id].name();
  }

  function getSymbol(uint8 _id) external view returns (string) {
    return commodities[_id].symbol();
  }

  function getMiningReward(uint8 _id) external view returns (uint) {
    return commodities[_id].miningReward();
  }

  function getMiningTarget(uint8 _id) external view returns (bytes32) {
    return commodities[_id].miningTarget();
  }

  function getBalance(uint8 _id) external view returns (uint) {
    return commodities[_id].balanceOf(msg.sender);
  }

  function getInterface(uint8 _id) external view returns (ICommodity) {
    return commodities[_id];
  }

  function() public {}
}
