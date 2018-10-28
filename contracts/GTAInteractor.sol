pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./GalacticTransitAuthorityInterface.sol";

// @dev Convenience contract to inherit GTA interface and related modifiers
contract GTAInteractor {
  using SafeMath for uint;

  GalacticTransitAuthorityInterface gta;

  event Log(uint x, uint y);

  constructor(address _gta) public {
    gta = GalacticTransitAuthorityInterface(_gta);
  }

  modifier onlyPlayer() {
    require(gta.isPlayer(msg.sender), "You need to own a spaceship to call this function");
    _;
  }

  modifier canFitCargo(address _player, uint _currentCargo, uint _incomingCargo) {
    uint _maxCargo = gta.getMaxCargo(_player);
    uint _cargoAvailable = _maxCargo.sub(_currentCargo);
    emit Log(_cargoAvailable, _incomingCargo);
    require(_cargoAvailable >= _incomingCargo, "Cannot fit this cargo");
    _;
  }

  modifier samePlanet(uint8 _planetId) {
    require(gta.getCurrentPlanet(msg.sender) == _planetId, "You are not on the right planet");
    _;
  }
}