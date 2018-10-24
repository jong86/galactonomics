pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

contract Commodity is ERC20Detailed, ERC20Mintable {
  constructor(string _name, string _symbol, uint8 _decimals)
  ERC20Detailed(_name, _symbol, _decimals)
  ERC20Mintable() public {}

  function transfer(address _to, uint256 _value) public returns (bool) {
    // super.transfer(_to, _value);
    return true;
  }
}