pragma solidity ^0.4.24;

contract IByzantianCrystal {
  function create(address) public pure returns (string) {}
  function balanceOf(address) public pure returns (uint) {}
  function totalSupply() public pure returns (uint) {}
  function ownerOf(uint) public pure returns (address) {}
  function tokenURI(uint) public pure returns (string) {}
  function transferToEscrow(address, uint) public pure {}
  function transferFromEscrow(address, uint) public pure {}
}