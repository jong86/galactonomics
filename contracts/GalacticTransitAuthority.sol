pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./ControlledByGEAAndGIA.sol";

contract GalacticTransitAuthority is ERC721, ControlledByGEAAndGIA {
  using SafeMath for uint;

  struct Spaceship {
    string name;
    uint8 currentPlanet;
    uint maxCargo; // in kg
    uint currentFuel; // in litres
    uint maxFuel;
  }

  uint public constant costOfSpaceship = 0.01 ether;
  // Hard-coding this for now (plan to implement planet-distances later)
  uint public constant fuelUsage = 20;
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
  event Log(uint x);

  modifier onlyPlayer() {
    require(isPlayer(msg.sender), "You need to own a spaceship to call this function");
    _;
  }


  // Action functions

  function buySpaceship(string _name) external payable {
    require(msg.value == costOfSpaceship, "You need to provide the correct amount of ether");
    require(balanceOf(msg.sender) == 0, "Accounts can only own one spaceship (for now)");

    numSpaceships = numSpaceships.add(1);
    uint _tokenId = numSpaceships;

    _mint(msg.sender, _tokenId);
    // currentPlanet 255 means 'not on a planet'
    addressToSpaceship[msg.sender] = Spaceship(_name, 255, 60000, 100, 100);
    addressOwnsSpaceship[msg.sender] = true;

    emit SpaceshipBought(msg.sender, _tokenId);
  }

  function travelToPlanet(uint8 _planetId) external onlyPlayer {
    require(0 <= _planetId && _planetId <= 6, "planetId must be between 0 and 6, inclusive");
    require(addressToSpaceship[msg.sender].currentFuel >= fuelUsage, "You do not have enough fuel to travel");

    addressToSpaceship[msg.sender].currentPlanet = _planetId;
    addressToSpaceship[msg.sender].currentFuel = addressToSpaceship[msg.sender].currentFuel.sub(fuelUsage);

    emit TravelComplete(msg.sender, _planetId, addressToSpaceship[msg.sender].currentFuel);
  }

  function refuel() external payable onlyPlayer {
    require(msg.value >= refuelCost, "You need to provide the correct amount of ether to refuel");
    addressToSpaceship[msg.sender].currentFuel = addressToSpaceship[msg.sender].maxFuel;
  }


  // View functions

  function getInfo() external view returns (
    string spaceshipName,
    uint8 currentPlanet,
    uint maxCargo,
    uint currentFuel,
    uint maxFuel
  ) {
    return (
      addressToSpaceship[msg.sender].name,
      addressToSpaceship[msg.sender].currentPlanet,
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

  function getMaxCargo(address _address) public view returns (uint) {
    return addressToSpaceship[_address].maxCargo;
  }

  function getAvailableCargo(address _address, uint _currentCargo) external view returns (uint) {
    return getMaxCargo(_address).sub(_currentCargo);
  }

  function isPlayer(address _address) public view returns (bool) {
    return addressOwnsSpaceship[_address];
  }

  function() public {}
}
