pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20Mintable.sol";

contract Commodity is ERC20Detailed, ERC20Mintable {
  constructor(string _name, string _symbol, uint8 _decimals)
  DetailedERC20(_name, _symbol, _decimals)
  MintableToken() public {}
}