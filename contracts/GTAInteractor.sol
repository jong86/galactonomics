pragma solidity ^0.4.24;

import "./GalacticTransitAuthorityInterface.sol";

// @dev Convenience contract to inherit GTA interface and related modifiers
contract GTAInteractor {
  GalacticTransitAuthorityInterface gta;

  constructor(address _gta) public {
    gta = GalacticTransitAuthorityInterface(_gta);
  }

  modifier onlyPlayer() {
    require(gta.isPlayer(msg.sender), "You need to own a spaceship to call this function");
    _;
  }

  // modifier hasEnoughCargoSpace() {

  //   _;
  // }
}