pragma solidity ^0.4.24;

contract IGTA {
  function getCurrentPlanet(address) external pure returns (uint8) {}
  function isPlayer(address) public pure returns (bool) {}
  function getMaxCargo(address) external pure returns (uint) {}
  function getAvailableCargo(address, uint) external pure returns (uint) {}
}