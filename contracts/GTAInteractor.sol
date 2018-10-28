pragma solidity ^0.4.24;

import "./GalacticTransitAuthorityInterface.sol";

// @dev Convenience contract to inherit GTA interface and related modifiers
contract GTAInteractor {
  GalacticTransitAuthorityInterface gta;

  event Log(uint x, uint y);

  constructor(address _gta) public {
    gta = GalacticTransitAuthorityInterface(_gta);
  }

  modifier onlyPlayer() {
    require(gta.isPlayer(msg.sender), "You need to own a spaceship to call this function");
    _;
  }

  modifier canFitCargo(address _player, uint _incomingCargo) {
    uint currentCargo;
    uint maxCargo;
    (currentCargo, maxCargo) = gta.checkCargo(_player);
    uint cargoAvailable = maxCargo - currentCargo;
    emit Log(cargoAvailable, _incomingCargo);
    require(cargoAvailable >= _incomingCargo, "Cannot fit this cargo");
    _;
  }

  modifier samePlanet(uint8 _planetId) {
    require(gta.getCurrentPlanet(msg.sender) == _planetId, "You are not on the right planet");
    _;
  }
}