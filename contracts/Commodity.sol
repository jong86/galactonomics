pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "./utils/ControlledByGEAAndGIA.sol";

// Use of variable name 'value' in here only to be consistent with ERC20 code
// Elsewhere 'value' is referred to as 'amount'
contract Commodity is ERC20Detailed, ERC20Mintable, ControlledByGEAAndGIA {
  constructor(string _name, string _symbol)
  ERC20Detailed(_name, _symbol, 0)
  ERC20Mintable() public {}

  function mint(address _to, uint _value) public onlyGIA returns (bool) {
    _mint(_to, _value);
    return true;
  }

  function transferForPlayer(address _from, address _to, uint _value) public onlyGEA returns (bool) {
    super._transfer(_from, _to, _value);
    return true;
  }

  function transfer(address _to, uint _value) public onlyGEA returns (bool) {
    super.transfer(_to, _value);
    return true;
  }


  // Blocked ERC20 functions (not desirable functionality right now)
  // Probably better to just make a new 'partial' erc20 contract to inherit from,
  // but doing this as a quick and easy for now
  function approve(address, uint256) public returns (bool) {
    revert("Blocked function");
    return false;
  }

  function transferFrom(address, address, uint256) public returns (bool) {
    revert("Blocked function");
    return false;
  }

  function increaseAllowance(address, uint256) public returns (bool) {
    revert("Blocked function");
    return false;
  }

  function decreaseAllowance(address, uint256) public returns (bool) {
    revert("Blocked function");
    return false;
  }
}