pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../utils/AccessControlled.sol";
import "../interfaces/ICommodity.sol";

/**
 * @title Commodity
 *
 * @notice Fungible units used for trading and forging Byzantian Crystals
 * @dev Use of variable name 'value' in this contract is to be consistent with ERC20 code --
 * elsewhere in this project, 'value' is referred to as 'amount'.
 */
contract Commodity is ERC20, ERC20Detailed, AccessControlled, ICommodity {
  constructor(string _name, string _symbol)
  ERC20Detailed(_name, _symbol, 0)
  public {}

  /**
   * @notice Creates more of a token for an account
   * @dev Called when investment in a commodity is made
   * @param _to Address of account to transfer to
   * @param _value Quantity of token to transfer
   * @return boolean true on success
   */
  function mint(address _to, uint _value) public returns (bool) {
    _mint(_to, _value);
    return true;
  }

  /**
   * @notice Transfers token into escrow on the contract
   * @dev Called when sell order created for token
   * @param _from Address of account to transfer from
   * @param _value Quantity of token to transfer
   * @return boolean true on success
   */
  function transferToEscrow(address _from, uint _value) public onlyGEA returns (bool) {
    _transfer(_from, geaAddress, _value);
    return true;
  }

  /**
   * @notice Burns a specified amount of the token
   * @dev Called when forging a crystal
   * @dev Can only be accessed by Temple Authority
   * @param _account Address of account to burn token from
   * @param _value Quantity of token to burn
   * @return boolean true on success
   */
  function burn(address _account, uint _value) public onlyTA returns (bool) {
    _burn(_account, _value);
    return true;
  }
}