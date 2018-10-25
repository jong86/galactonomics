pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Commodity is ERC20Detailed, ERC20Mintable, Ownable {
  constructor(string _name, string _symbol, uint8 _decimals)
  ERC20Detailed(_name, _symbol, _decimals)
  ERC20Mintable() public {}

  // function transfer(address to, uint256 value) public onlyGEA returns (bool) {
  //   // Relay call to original ERC20 transfer function
  //   // super.transfer(_to, _value);
  //   return true;
  // }
}