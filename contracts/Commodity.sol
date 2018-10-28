pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "./ControlledByGEAAndGIA.sol";

// Use of variable name 'value' in here only to be consistent with ERC20 code
// Elsewhere 'value' is referred to as 'quantity'
contract Commodity is ERC20Detailed, ERC20Mintable, Ownable, ControlledByGEAAndGIA {
  constructor(string _name, string _symbol, uint8 _decimals)
  ERC20Detailed(_name, _symbol, _decimals)
  ERC20Mintable() public {}

  function transferForPlayer(address _from, address _to, uint _value) public onlyGEA returns (bool) {
    super._transfer(_from, _to, _value);
    return true;
  }

  function transfer(address _to, uint _value) public onlyGEA returns (bool) {
    super.transfer(_to, _value);
    return true;
  }

  function mint(address _to, uint _value) public onlyGIA returns (bool) {
    _mint(_to, _value);
    return true;
  }
}