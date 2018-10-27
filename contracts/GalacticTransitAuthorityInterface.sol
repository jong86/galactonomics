pragma solidity ^0.4.24;

contract GalacticTransitAuthorityInterface {
  function getCurrentPlanet(address) external pure returns (uint8) {}
  function isPlayer(address) public pure returns (bool) {}
  function adjustCurrentCargo(address, uint) public pure returns (bool) {}
  function checkCargo(address) public pure returns (uint, uint) {}
}