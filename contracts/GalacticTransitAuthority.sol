pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract GalacticTransitAuthority is ERC721 {
  uint numSpaceships;

  constructor() public ERC721() {}

  function buySpaceship() external payable {
    numSpaceships++;
    _mint(msg.sender, numSpaceships);
  }

  function() public {}
}
