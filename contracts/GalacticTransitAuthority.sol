pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./ControlledByGEAAndGIA.sol";

contract GalacticTransitAuthority is ERC721, ControlledByGEAAndGIA {
  using SafeMath for uint; // not working

  struct Spaceship {
    string name;
    uint8 currentPlanet;
    uint currentCargo;
    uint maxCargo;
    uint currentFuel;
    uint maxFuel;
  }

  // Hard-coding this for now (plan to implement planet-distances later)
  uint public constant fuelUsage = 33;
  // Hard-coding this for now (plan to implement variable refueling costs later)
  uint public constant refuelCost = 10000000000000000; // 0.01 ether

  uint numSpaceships;

  // For looking up spaceship
  mapping(address => Spaceship) public addressToSpaceship;
  // For verification that a user is a spaceship-owning player:
  mapping(address => bool) public addressOwnsSpaceship;

  event SpaceshipBought(address owner, uint tokenId);
  event TravelComplete(address player, uint8 planetId, uint currentFuel);
  event RefuelComplete(address player);
  event CargoAdjusted(address player, uint currentCargo, uint maxCargo);
  event Log(uint x);
  event LogMax(uint x);


  // Action functions

  function buySpaceship(string _name) external payable {
    require(balanceOf(msg.sender) == 0, "Accounts can only own one spaceship (for now)");

    numSpaceships++;
    uint _tokenId = numSpaceships;

    _mint(msg.sender, _tokenId);
    addressToSpaceship[msg.sender] = Spaceship(_name, 0, 0, 100000, 100, 100);
    addressOwnsSpaceship[msg.sender] = true;

    emit SpaceshipBought(msg.sender, _tokenId);
  }

  function travelToPlanet(uint8 _planetId) external {
    require(isPlayer(msg.sender), "You need to own a spaceship to travel");
    require(0 < _planetId && _planetId < 7, "planetId must be between 0 and 6, inclusive");
    require(addressToSpaceship[msg.sender].currentFuel >= fuelUsage, "You do not have enough fuel to travel");

    addressToSpaceship[msg.sender].currentPlanet = _planetId;
    addressToSpaceship[msg.sender].currentFuel -= fuelUsage;

    emit TravelComplete(msg.sender, _planetId, addressToSpaceship[msg.sender].currentFuel);
  }

  function refuel() external payable {
    require(isPlayer(msg.sender), "You need to own a spaceship to refuel");
    require(msg.value >= refuelCost, "You need to provide the correct amount of ether to refuel");
    addressToSpaceship[msg.sender].currentFuel = addressToSpaceship[msg.sender].maxFuel;
  }

  // function adjustCurrentCargo(address _address, uint _absDiff, bool _hasPositiveSign) external onlyGEAOrGIA returns (bool) {
  //   if (_hasPositiveSign) {
  //     addressToSpaceship[_address].currentCargo += _absDiff;
  //   } else {
  //     addressToSpaceship[_address].currentCargo -= _absDiff;
  //   }
  //   return true;
  // }

  function addCargo(address _address, uint _mass) external {
    addressToSpaceship[_address].currentCargo += _mass;
    emit Log(addressToSpaceship[_address].currentCargo);
    emit Log(addressToSpaceship[_address].maxCargo);
    emit CargoAdjusted(_address, addressToSpaceship[_address].currentCargo, addressToSpaceship[_address].maxCargo);
  }

  // function removeCargo(address _address, uint _mass) external onlyGEAOrGIA {
  //   addressToSpaceship[_address].currentCargo -= _mass;
  // }


  // View functions

  function getInfo() external view returns (
    string name,
    uint8 currentPlanet,
    uint currentCargo,
    uint maxCargo,
    uint currentFuel,
    uint maxFuel
  ) {
    return (
      addressToSpaceship[msg.sender].name,
      addressToSpaceship[msg.sender].currentPlanet,
      addressToSpaceship[msg.sender].currentCargo,
      addressToSpaceship[msg.sender].maxCargo,
      addressToSpaceship[msg.sender].currentFuel,
      addressToSpaceship[msg.sender].maxFuel
    );
  }

  function getCurrentPlanet(address _address) public view returns (uint8) {
    return addressToSpaceship[_address].currentPlanet;
  }

  function checkFuel(address _address) public view returns (uint currentFuel, uint maxFuel) {
    return (
      addressToSpaceship[_address].currentFuel,
      addressToSpaceship[_address].maxFuel
    );
  }

  function checkCargo(address _address) external view returns (uint currentCargo, uint maxCargo) {
    return (
      addressToSpaceship[_address].currentCargo,
      addressToSpaceship[_address].maxCargo
    );
  }

  function isPlayer(address _address) public view returns (bool) {
    return addressOwnsSpaceship[_address];
  }

  function() public {}
}
