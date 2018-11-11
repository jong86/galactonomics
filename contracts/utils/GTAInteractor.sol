pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../interfaces/GTAInterface.sol";

/**
 * @dev Extends a contract with convenient functions for interacting with GTA
 */
contract GTAInteractor {
  using SafeMath for uint;

  GTAInterface gta;

  event CanFitCargo(uint available, uint incoming);

  constructor(address _gta) public {
    gta = GTAInterface(_gta);
  }

  modifier onlyPlayer() {
    require(gta.isPlayer(msg.sender), "You need to own a spaceship to call this function");
    _;
  }

  modifier canFitCargo(address _player, uint _currentCargo, uint _incomingCargo) {
    uint _maxCargo = gta.getMaxCargo(_player);
    uint _cargoAvailable = _maxCargo.sub(_currentCargo);
    emit CanFitCargo(_cargoAvailable, _incomingCargo);
    require(_cargoAvailable >= _incomingCargo, "Cannot fit this cargo");
    _;
  }

  modifier samePlanet(uint8 _planetId) {
    require(gta.getCurrentPlanet(msg.sender) == _planetId, "You are not on the right planet");
    _;
  }
}