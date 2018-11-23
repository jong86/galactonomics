pragma solidity ^0.4.24;

contract ICommodity {
  function transferToEscrow(address, uint) public returns (bool) {}
  function transfer(address, uint) public returns (bool) {}
  function mint(address, uint) public returns (bool) {}
  function burn(address, uint) public returns (bool) {}
  function balanceOf(address) public view returns (uint) {}
  function name() public view returns(string) {}
  function symbol() public view returns(string) {}

  function setGEA(address) public {}
  function setGIA(address) public {}
  function setTA(address) public {}
}