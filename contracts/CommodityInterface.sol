pragma solidity ^0.4.24;

contract CommodityInterface {
  function transferForPlayer(address, address, uint256) public pure returns (bool) {}
  function transfer(address, uint256) public pure returns (bool) {}
  function mint(address, uint256) public pure returns (bool) {}
  function balanceOf(address) public pure returns (uint256) {}
  function name() public pure returns(string) {}
  function symbol() public pure returns(string) {}
}