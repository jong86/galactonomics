pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "./ControlledByGEAAndGIA.sol";

contract GalacticTransitAuthority is ERC721, ControlledByGEAAndGIA {
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
  // Hard-coding this for now (plan to implement variable fuel costs later)
  uint256 public constant refuelCost = 10000000000000000; // 0.01 ether

  uint numSpaceships;

  mapping(uint => Spaceship) public tokenIdToSpaceship;
  mapping(address => uint) public addressToTokenId;
  // For verification that a user is a spaceship-owning player:
  mapping(address => bool) public addressOwnsSpaceship;

  event SpaceshipBought(address owner, uint tokenId);
  event TravelComplete(address player, uint8 planetId, uint currentFuel);
  event RefuelComplete(address player);
  event Log(uint x);

  function buySpaceship(string _name) external payable {
    require(balanceOf(msg.sender) == 0, "Accounts can only own one spaceship for now");

    numSpaceships++;
    uint _tokenId = numSpaceships;

    _mint(msg.sender, _tokenId);
    Spaceship memory spaceship = Spaceship(_name, 0, 0, 100000, 100, 100);
    tokenIdToSpaceship[_tokenId] = spaceship;
    addressToTokenId[msg.sender] = _tokenId;
    addressOwnsSpaceship[msg.sender] = true;

    emit SpaceshipBought(msg.sender, _tokenId);
  }

  function travelToPlanet(uint8 _planetId) external {
    require(isPlayer(msg.sender), "You need to own a spaceship to travel");
    require(0 < _planetId && _planetId < 7, "planetId must be between 0 and 6, inclusive");
    uint currentFuel;
    (currentFuel,) = checkFuel(msg.sender);
    require(currentFuel > fuelUsage, "You do not have enough fuel to travel");

    tokenIdToSpaceship[addressToTokenId[msg.sender]].currentPlanet = _planetId;
    tokenIdToSpaceship[addressToTokenId[msg.sender]].currentFuel -= fuelUsage;

    emit TravelComplete(
      msg.sender,
      _planetId,
      tokenIdToSpaceship[addressToTokenId[msg.sender]].currentFuel
    );
  }

  function refuel() external payable {
    require(isPlayer(msg.sender), "You need to own a spaceship to refuel");
    require(msg.value >= refuelCost, "You need to provide the correct amount of ether to refuel");
    tokenIdToSpaceship[addressToTokenId[msg.sender]].currentFuel = tokenIdToSpaceship[addressToTokenId[msg.sender]].maxFuel;
  }

  function adjustCurrentCargo() public onlyGEAOrGIA {
    emit Log(42);
  }



  function getInfo() external view returns (
    string name,
    uint8 currentPlanet,
    uint currentCargo,
    uint maxCargo,
    uint currentFuel,
    uint maxFuel
  ) {
    Spaceship memory spaceship = tokenIdToSpaceship[addressToTokenId[msg.sender]];
    return (
      spaceship.name,
      spaceship.currentPlanet,
      spaceship.currentCargo,
      spaceship.maxCargo,
      spaceship.currentFuel,
      spaceship.maxFuel
    );
  }

  function getCurrentPlanet(address _address) public view returns (uint8) {
    return tokenIdToSpaceship[addressToTokenId[_address]].currentPlanet;
  }

  function checkFuel(address _address) public view returns (uint currentFuel, uint maxFuel) {
    return (
      tokenIdToSpaceship[addressToTokenId[_address]].currentFuel,
      tokenIdToSpaceship[addressToTokenId[_address]].maxFuel
    );
  }

  function checkCargo(address _address) public view returns (uint currentCargo, uint maxCargo) {
    return (
      tokenIdToSpaceship[addressToTokenId[_address]].currentCargo,
      tokenIdToSpaceship[addressToTokenId[_address]].maxCargo
    );
  }

  function isPlayer(address _address) public view returns (bool) {
    return addressOwnsSpaceship[_address];
  }

  function() public {}
}
