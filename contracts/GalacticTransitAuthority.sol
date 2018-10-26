pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract GalacticTransitAuthority is ERC721 {
  struct Spaceship {
    
  }

  uint numSpaceships;

  mapping(uint => Spaceship) public spaceships;

  constructor() public ERC721() {}

  function buySpaceship() external payable {
    numSpaceships++;
    _mint(msg.sender, numSpaceships);
  }

  function travelToPlanet(uint8 _planetId) external {

  }

  function() public {}
}
