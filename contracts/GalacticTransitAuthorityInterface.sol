pragma solidity ^0.4.24;

contract GalacticTransitAuthorityInterface {
  function getCurrentPlanet(address _address) external view returns (uint8) {}
  function isPlayer(address _address) public view returns (bool) {}
}