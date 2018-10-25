pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Commodity is ERC20Detailed, ERC20Mintable, Ownable {
  address private gea;
  address private gia;

  constructor(string _name, string _symbol, uint8 _decimals)
  ERC20Detailed(_name, _symbol, _decimals)
  ERC20Mintable() public {}

  modifier onlyGEA() {
    require(msg.sender == gea, "Only the Galactic Economic Authority may access this function");
    _;
  }

  modifier onlyGIA() {
    require(msg.sender == gia, "Only the Galactic Industrial Authority may access this function");
    _;
  }

  // function transfer(address to, uint256 value) public onlyGEA returns (bool) {
  //   // Relay call to original ERC20 transfer function
  //   // super.transfer(_to, _value);
  //   return true;
  // }

  function mint(address to, uint256 value) public onlyGIA returns (bool) {
    return super.mint(to, value);
  }

  function setGIA(address _gia) public onlyOwner {
    gia = _gia;
  }
}