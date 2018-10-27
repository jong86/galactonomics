pragma solidity ^0.4.24;

contract GalacticTransitAuthorityInterface {
  function getCurrentPlanet(address) external pure returns (uint8) {}
  function isPlayer(address) public pure returns (bool) {}
  function changeCurrentCargo(address, uint) external pure returns (bool) {}
  function checkCargo(address) external pure returns (uint, uint) {}
}