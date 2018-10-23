pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract GalacticIndustrialAuthority is Ownable {
  uint storedData;

  function set(uint x) public onlyOwner {
    storedData = x;
  }

  function get() public view onlyOwner returns (uint) {
    return storedData;
  }
}
