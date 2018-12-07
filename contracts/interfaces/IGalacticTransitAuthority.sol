pragma solidity ^0.4.24;
import "./ICommodity.sol";

contract IGalacticTransitAuthority {
  function getCurrentPlanet(address) public view returns (uint) {}
  function isPlayer(address) public view returns (bool) {}
  function getMaxCargo(address) public view returns (uint) {}
  function getAvailableCargo(address, uint) external view returns (uint) {}
  function canFitCargo(address, uint, uint) external returns (bool) {}
}