pragma solidity ^0.4.24;

contract CommodityInterface {
  function transferForPlayer(address _from, address _to, uint256 _value) public returns (bool) {}
  function mint(address _to, uint256 _value) public returns (bool) {}
}