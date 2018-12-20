pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./utils/AccessControlled.sol";
import "./libraries/AddressCast.sol";
import "./libraries/BytesCast.sol";
import "./libraries/UintCast.sol";
import "./libraries/Array256Lib.sol";

/**
 * @title CommodityAuthority
 *
 * @notice This contract manages the commodities
 */
contract CommodityAuthority is Ownable, AccessControlled {
  using SafeMath for uint;
  using AddressCast for address;
  using BytesCast for bytes32;
  using UintCast for uint;
  using Array256Lib for uint[];

  // Mapping of commodityId to address to amount of commodity owned
  mapping (uint => mapping (address => uint)) balances;

  // Mapping of commodityId to total circulating supply of that commodity
  mapping (uint => uint) totalSupplyOf;

  // Mapping of address to array containing Ids of commodities owned (for iterating)
  mapping (address => uint[]) commoditiesOwned;

  // Mapping of commodityId to previous mining hash
  mapping (uint => bytes32) prevMiningHashes;

  event CommodityMined(bytes32 _hash, address _miner);
  event Minted(address _to, uint _id, uint _amount);
  event Burned(address _owner, uint _id, uint _amount);

  event LogB(bytes32 b);
  event LogS(string s);
  event LogN(uint n);

  /**
   * @notice Mints new commodity tokens for a player
   * @param _nonce Value found that when hashed (using SHA-256) with the previous proof-of-work hash found for a
   *  commodity, results in an acceptable hash according to current target for that commodity
   */
  function submitPOW(uint _nonce, uint _commodityId) external {
    bytes32 _hash = sha256(
      abi.encodePacked(
        _nonce.toString(),
        _commodityId.toString(),
        prevMiningHashes[_commodityId].toString(),
        msg.sender.toString()
      )
    );

    require(_hash < getMiningTarget(_commodityId), "That proof-of-work is not valid");
    require(_mint(msg.sender, _commodityId, getMiningReward(_commodityId)), "Error sending reward");
    prevMiningHashes[_commodityId] = _hash;
    emit CommodityMined(_hash, msg.sender);
  }

  /**
   * @notice Returns data on a commodity
   * @param _id Id of commodity
   */
  function getCommodity(uint _id) external view returns (
    bytes32 uri,
    uint miningReward,
    bytes32 miningTarget,
    string prevMiningHash
  ) {
    return (
      getURI(_id),
      getMiningReward(_id),
      getMiningTarget(_id),
      prevMiningHashes[_id].toString()
    );
  }

  /**
   * @notice Returns amount of commodity an account owns
   * @param _address Address of account to look up
   * @param _commodityId Id of commodity
   */
  function balanceOf(address _address, uint _commodityId) public view returns (uint) {
    return balances[_commodityId][_address];
  }

  /**
   * @notice Returns list of commodity Ids owned by an address
   * @param _address Address of account to look up
   */
  function getCommoditiesOwned(address _address) public view returns (uint[]) {
    return commoditiesOwned[_address];
  }

  /**
   * @notice Transfers amount of commodity from seller to this contract
   * @param _seller Address of account to transfer from
   * @param _commodityId Id of commodity
   * @param _amount Amount of commodity to transfer
   */
  function transferToEscrow(address _seller, uint _commodityId, uint _amount) public returns (bool) {
    balances[_commodityId][_seller].sub(_amount);
    balances[_commodityId][address(this)].add(_amount);
    // Manage commoditiesOwned array:

    return true;
  }

  /**
   * @notice Transfers amount of commodity from this contract to buyer
   * @param _buyer Address of account to transfer from
   * @param _commodityId Id of commodity
   * @param _amount Amount of commodity to transfer
   */
  function transferFromEscrow(address _buyer, uint _commodityId, uint _amount) public returns (bool) {
    balances[_commodityId][address(this)].sub(_amount);
    balances[_commodityId][_buyer].add(_amount);
    // Manage commoditiesOwned array:

    return true;
  }

  /**
   * @notice Creates new units of commodity and assigns ownership to given address
   * @param _to Address of account that mined the commodity
   * @param _id Id of commodity
   * @param _amount How many units of commodity to mint
   */
  function _mint(address _to, uint _id, uint _amount) private returns (bool) {
    // Add amount to owner's balance
    balances[_id][_to] = balances[_id][_to].add(_amount);
    // Add amount to total supply
    totalSupplyOf[_id] = totalSupplyOf[_id].add(_amount);

    // Check if user doesn't already own this commodity
    if (!commoditiesOwned[_to].contains(_id)) {
      // If not, add the commodity Id to commoditiesOwned for that player
      commoditiesOwned[_to].push(_id);
    }

    emit Minted(_to, _id, _amount);
    return true;
  }

  /**
   * @notice Burns given amount of a commodity
   * @param _owner Address of account that owns the commodity
   * @param _id Id of commodity
   * @param _amount How many units of commodity to burn
   */
  function burn(address _owner, uint _id, uint _amount) external returns (bool) {
    // Subtract amount from owner's balance
    balances[_id][_owner] = balances[_id][_owner].sub(_amount);
    // Subtract amount from total supply
    totalSupplyOf[_id] = totalSupplyOf[_id].sub(_amount);

    // Check if user now owns 0 amount of that commodity
    if (balances[_id][_owner] == 0) {
      // If balance is zero, remove id from commoditiesOwned
      commoditiesOwned[_owner].remove(_id);
    }

    emit Burned(_owner, _id, _amount);
    return true;
  }

  function() public {}
}
