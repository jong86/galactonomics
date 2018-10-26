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

  function buySpaceship(string _name) external payable {
    require(balanceOf(msg.sender) == 0, "Accounts can only own one spaceship for now");

    numSpaceships++;
    uint _tokenId = numSpaceships;

    _mint(msg.sender, _tokenId);
    tokenIdToSpaceship[_tokenId] = Spaceship(
      _name,
      0,
      0,
      100000,
      100,
      100
    );
    emit SpaceshipBought(msg.sender, _tokenId);
    emit Log(balanceOf(msg.sender));
  }


  function travelToPlanet(uint8 _planetId) external {

  }

  function() public {}
}
