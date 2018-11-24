pragma solidity ^0.4.24;

contract ICommodity {
  function dispenseReward(address) public returns (bool) {}
  function transferToEscrow(address, uint) public returns (bool) {}
  function transfer(address, uint) public returns (bool) {}
  function burn(address, uint) public returns (bool) {}
  function balanceOf(address) public view returns (uint) {}
  function name() public view returns(string) {}
  function symbol() public view returns(string) {}
  function miningReward() public view returns(uint) {}
  function miningTarget() public view returns(bytes32) {}

  function setGEA(address) public {}
  function setGIA(address) public {}
  function setTA(address) public {}
}