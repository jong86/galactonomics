pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./utils/AccessControlled.sol";
import "./items/Commodity.sol";
import "./interfaces/IGalacticTransitAuthority.sol";

/**
 * @title Galactic Transit Authority (GTA)
 *
 * @notice The GTA handles spaceship ownership, fuel and travel
 */
contract GalacticTransitAuthority is ERC721, AccessControlled, IGalacticTransitAuthority {
  using SafeMath for uint;

  struct Spaceship {
    string name;
    uint8 currentPlanet;
    uint maxCargo; // in kg
    uint currentFuel; // in litres
    uint maxFuel;
  }

  uint public constant costOfSpaceship = 0.01 ether;
  // How much fuel is used to travel between planets
  uint public constant fuelUsage = 20;
  uint public constant refuelCost = 10000000000000000;
  // Number of spaceships in existence
  uint numSpaceships;

  // Mapping of address to spaceship struct
  mapping(address => Spaceship) public addressToSpaceship;
  // Resolves to true if account owns an address
  mapping(address => bool) public addressOwnsSpaceship;

  event SpaceshipBought(address owner, uint tokenId);
  event TravelComplete(address player, uint8 planetId, uint currentFuel);
  event RefuelComplete(address player);

  modifier onlyPlayer() {
    require(isPlayer(msg.sender), "You need to own a spaceship to call this function");
    _;
  }

  /**
   * @notice Creates a spaceship and assigns ownership to sender
   * @dev Spaceship ownership is a prerequisite for owning commodities
   * @param _name What to name your spaceship
   */
  function buySpaceship(string _name) external payable {
    require(msg.value == costOfSpaceship, "You need to provide the correct amount of ether");
    require(balanceOf(msg.sender) == 0, "Accounts can only own one spaceship (for now)");
    numSpaceships = numSpaceships.add(1);
    uint _tokenId = numSpaceships;
    _mint(msg.sender, _tokenId);
    addressToSpaceship[msg.sender] = Spaceship(_name, 255, 90000, 100, 100);
    addressOwnsSpaceship[msg.sender] = true;
    emit SpaceshipBought(msg.sender, _tokenId);
  }

  /**
   * @notice Changes spaceship's current planet to planet specified
   * @dev This function is responsible for deciding which planet IDs are valid planets
   * @param _planetId Id of planet to travel to (0 - 6), or 255 for the 8th planet
   */
  function travelToPlanet(uint8 _planetId) external onlyPlayer {
    require((0 <= _planetId && _planetId <= 6) || _planetId == 255, "planetId must be between 0 and 6, inclusive, or be equal to 255");
    require(addressToSpaceship[msg.sender].currentFuel >= fuelUsage, "You do not have enough fuel to travel");
    addressToSpaceship[msg.sender].currentPlanet = _planetId;
    addressToSpaceship[msg.sender].currentFuel = addressToSpaceship[msg.sender].currentFuel.sub(fuelUsage);
    emit TravelComplete(msg.sender, _planetId, addressToSpaceship[msg.sender].currentFuel);
  }

  /**
   * @notice Changes spaceship's current fuel to max fuel, for a fee in ether
   * @dev Throws if cost to refuel is not provided
   */
  function refuel() external payable onlyPlayer {
    require(msg.value >= refuelCost, "You need to provide the correct amount of ether to refuel");
    addressToSpaceship[msg.sender].currentFuel = addressToSpaceship[msg.sender].maxFuel;
  }

  /**
   * @notice Returns player's spaceship info
   */
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

  function isPlayer(address _address) public view returns (bool) {
    return addressOwnsSpaceship[_address];
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

  function canFitCargo(address _player, uint _currentCargo, uint _incomingCargo) external returns (bool) {
    uint _maxCargo = getMaxCargo(_player);
    uint _cargoAvailable = _maxCargo.sub(_currentCargo);
    return _cargoAvailable >= _incomingCargo;
  }

  function() public {}
}
