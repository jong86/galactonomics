pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract GalacticTransitAuthority is ERC721 {
  struct Spaceship {
    string name;
    uint8 currentPlanet;
    uint currentCargo;
    uint maxCargo;
    uint currentFuel;
    uint maxFuel;
  }

  event Log(uint256 num);
  event SpaceshipBought(address owner, uint tokenId);

  uint numSpaceships;

  mapping(uint => Spaceship) public tokenIdToSpaceship;
  mapping(address => uint) public addressToTokenId;

  function buySpaceship(string _name) external payable {
    require(balanceOf(msg.sender) == 0, "Accounts can only own one spaceship for now");

    numSpaceships++;
    uint _tokenId = numSpaceships;

    _mint(msg.sender, _tokenId);
    Spaceship memory spaceship = Spaceship(_name, 0, 0, 100000, 100, 100);
    tokenIdToSpaceship[_tokenId] = spaceship;
    addressToTokenId[msg.sender] = _tokenId;
    emit SpaceshipBought(msg.sender, _tokenId);
  }

  function travelToPlanet(uint8 _planetId) external {
    require(0 < _planetId && _planetId < 7, "planetId must be between 0 and 6, inclusive");
    tokenIdToSpaceship[addressToTokenId[msg.sender]].currentPlanet = _planetId;
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

  function getCurrentPlanet(address _address) external view returns (uint8) {
    return tokenIdToSpaceship[addressToTokenId[_address]].currentPlanet;
  }

  function() public {}
}
