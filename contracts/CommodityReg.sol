pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./utils/AccessControlled.sol";
import "./libraries/Array256Lib.sol";

/**
 * @title CommodityReg
 *
 * @notice This contract manages ownership and minting of the commodities
 */
contract CommodityReg is Ownable, AccessControlled {
  using SafeMath for uint;
  using Array256Lib for uint[];

  // Mapping of commodityId to address to amount of commodity owned
  mapping (uint => mapping (address => uint)) public balances;

  // Mapping of commodityId to total circulating supply of that commodity
  mapping (uint => uint) public totalSupplyOf;

  // Mapping of address to array containing Ids of commodities owned (for iterating)
  mapping (address => uint[]) public commoditiesOwned;

  event Minted(address _to, uint _id, uint _amount);
  event Burned(address _owner, uint _id, uint _amount);

  /**
   * @notice Creates new units of commodity and assigns ownership to given address
   * @param _to Address of account that mined the commodity
   * @param _id Id of commodity
   * @param _amount How many units of commodity to mint
   */
  function mint(address _to, uint _id, uint _amount) external onlyCommodityInd returns (bool) {
    // Add amount to owner's balance
    balances[_id][_to] = balances[_id][_to].add(_amount);
    // Add amount to total supply
    totalSupplyOf[_id] = totalSupplyOf[_id].add(_amount);

    _adjustCommoditiesOwnedForDeposit(_to, _id);

    emit Minted(_to, _id, _amount);
    return true;
  }

  /**
   * @notice Burns given amount of a commodity
   * @param _owner Address of account that owns the commodity
   * @param _id Id of commodity
   * @param _amount How many units of commodity to burn
   */
  function burn(address _owner, uint _id, uint _amount) external onlyCommodityInd returns (bool) {
    // Subtract amount from owner's balance
    balances[_id][_owner] = balances[_id][_owner].sub(_amount);
    // Subtract amount from total supply
    totalSupplyOf[_id] = totalSupplyOf[_id].sub(_amount);

    _adjustCommoditiesOwnedForWithdraw(_owner, _id);

    emit Burned(_owner, _id, _amount);
    return true;
  }

  /**
   * @notice Transfers amount of commodity from seller to this contract
   * @param _from Address of account to transfer from
   * @param _id Id of commodity
   * @param _amount Amount of commodity to transfer
   */
  function transferToEscrow(address _from, uint _id, uint _amount) external onlyCommodityEcon returns (bool) {
    // Subtract amount from seller's balance
    balances[_id][_from] = balances[_id][_from].sub(_amount);
    // Add amount to escrow balance
    balances[_id][address(this)] = balances[_id][address(this)].add(_amount);

    _adjustCommoditiesOwnedForWithdraw(_from, _id);
    _adjustCommoditiesOwnedForDeposit(address(this), _id);

    return true;
  }

  /**
   * @notice Transfers amount of commodity from this contract to buyer
   * @param _to Address of account to transfer to
   * @param _id Id of commodity
   * @param _amount Amount of commodity to transfer
   */
  function transferFromEscrow(address _to, uint _id, uint _amount) external onlyCommodityEcon returns (bool) {
    // Subtract amount from escrow balance
    balances[_id][address(this)] = balances[_id][address(this)].sub(_amount);
    // Add amount to buyer's balance
    balances[_id][_to] = balances[_id][_to].add(_amount);

    _adjustCommoditiesOwnedForWithdraw(address(this), _id);
    _adjustCommoditiesOwnedForDeposit(_to, _id);

    return true;
  }

  /**
   * @notice Manages commoditiesOwned array
   * @param _account Address of account to transfer to
   * @param _id Id of commodity
   */
  function _adjustCommoditiesOwnedForWithdraw(address _account, uint _id) private {
    // Check if account owns 0 amount of that commodity
    if (balances[_id][_account] == 0) {
      // If balance is 0, remove commodityId from commoditiesOwned
      commoditiesOwned[_account].remove(_id);
    }
  }

  /**
   * @notice Manages commoditiesOwned array
   * @param _account Address of account to transfer to
   * @param _id Id of commodity
   */
  function _adjustCommoditiesOwnedForDeposit(address _account, uint _id) private {
    // Check if account doesn't already own this commodity
    if (!commoditiesOwned[_account].contains(_id)) {
      // If not, add the commodityId to commoditiesOwned for that player
      commoditiesOwned[_account].push(_id);
    }
  }

  /**
   * @notice Returns URI of a commodity
   * @param _id Id of commodity
   */
  function getURI(uint _id) external view returns (bytes32) {
    return sha256(abi.encodePacked((_id)));
  }

  /**
   * @notice Returns amount of commodity an account owns
   * @param _address Address of account to look up
   * @param _id Id of commodity
   */
  function balanceOf(address _address, uint _id) external view returns (uint) {
    return balances[_id][_address];
  }

  /**
   * @notice Returns list of commodity Ids owned by an address
   * @param _address Address of account to look up
   */
  function getCommoditiesOwned(address _address) external view returns (uint[]) {
    return commoditiesOwned[_address];
  }

  function() public {}
}
