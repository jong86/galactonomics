pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./utils/AccessControlled.sol";
import "./libraries/AddressCast.sol";
import "./libraries/BytesCast.sol";
import "./libraries/UintCast.sol";
import "./libraries/Array256Lib.sol";

/**
 * @title CommodityReg
 *
 * @notice This contract manages minting and ownership of the commodities
 */
contract CommodityReg is Ownable, AccessControlled {
  using SafeMath for uint;
  using AddressCast for address;
  using BytesCast for bytes32;
  using UintCast for uint;
  using Array256Lib for uint[];

  // Mapping of commodityId to address to amount of commodity owned
  mapping (uint => mapping (address => uint)) public balances;

  // Mapping of commodityId to total circulating supply of that commodity
  mapping (uint => uint) public totalSupplyOf;

  // Mapping of address to array containing Ids of commodities owned (for iterating)
  mapping (address => uint[]) public commoditiesOwned;

  // Mapping of commodityId to block number to bool indicating if commodity was mined in that block
  mapping (uint => mapping (uint => bool)) public wasMinedInBlock;

  event CommodityMined(bytes32 _hash, address _miner);
  event Minted(address _to, uint _id, uint _amount);
  event Burned(address _owner, uint _id, uint _amount);
  event AlreadyMined(address _sender);

  event LogB(bytes32 b);
  event LogS(string s);
  event LogN(uint n);
  event LogBool(bool b);


  // Mining

  /**
   * @notice Mints new commodity tokens for a player
   * @param _nonce Value found that when sha256-hashed with the other params used in the code, results in an
   *  acceptable hash value less than the target difficulty for the commodity
   * @param _commodityId Id of commodity that you mined
   */
  function submitPOW(uint _nonce, uint _commodityId) external {
    // Block further access to function if reward already claimed for a block
    if (wasMinedInBlock[_commodityId][block.number] == true) {
      emit AlreadyMined(msg.sender);
      return;
    }

    // Make the hash
    bytes32 _hash = sha256(
      abi.encodePacked(
        _nonce.toString(),
        _commodityId.toString(),
        msg.sender.toString()
      )
    );

    bytes32 _uri;
    uint _miningReward;
    uint _miningTarget;
    (_uri, _miningReward, _miningTarget) = getCommodity(_commodityId);

    // Check if hash is valid
    require(uint(_hash) < _miningTarget, "That proof-of-work is not valid");

    // Flag to prevent more than one miner to claim reward per block, per commodity
    wasMinedInBlock[_commodityId][block.number] = true;

    // Send reward
    require(_mint(msg.sender, _commodityId, _miningReward), "Error sending reward");

    emit CommodityMined(_hash, msg.sender);
  }

  /**
   * @notice Returns commodity data
   * @param _id Id of commodity
   */
  function getCommodity(uint _id) public view returns (
    bytes32 uri,
    uint miningReward,
    uint miningTarget
  ) {
    return (
      sha256(abi.encodePacked((_id))),
      getMiningReward(_id),
      getMiningTarget(_id)
    );
  }

  /**
   * @notice Returns URI of a commodity
   * @param _id Id of commodity
   */
  function getURI(uint _id) public view returns (bytes32) {
    return sha256(abi.encodePacked((_id)));
  }

  /**
   * @notice Returns mining reward of a commodity
   * @param _id Id of commodity
   */
  function getMiningReward(uint _id) public view returns (uint) {
    return 24000;
  }

  /**
   * @notice Returns mining target of a commodity
   * @param _id Id of commodity
   */
  function getMiningTarget(uint _id) public view returns (uint) {
    return 0x000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
  }


  // Ownership

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
   * @param _from Address of account to transfer from
   * @param _commodityId Id of commodity
   * @param _amount Amount of commodity to transfer
   */
  function transferToEscrow(address _from, uint _commodityId, uint _amount) public returns (bool) {
    // Subtract amount from seller's balance
    balances[_commodityId][_from] = balances[_commodityId][_from].sub(_amount);
    // Add amount to escrow balance
    balances[_commodityId][address(this)] = balances[_commodityId][address(this)].add(_amount);

    // Manage commoditiesOwned array for escrow --
    // Check if contract doesn't already have this commodity in escrow
    if (!commoditiesOwned[address(this)].contains(_commodityId)) {
      // If not, add the commodity Id to commoditiesOwned for that player
      commoditiesOwned[address(this)].push(_commodityId);
    }

    return true;
  }

  /**
   * @notice Transfers amount of commodity from this contract to buyer
   * @param _buyer Address of account to transfer from
   * @param _commodityId Id of commodity
   * @param _amount Amount of commodity to transfer
   */
  function transferFromEscrow(address _buyer, uint _commodityId, uint _amount) public returns (bool) {
    // Subtract amount from escrow balance
    balances[_commodityId][address(this)] = balances[_commodityId][address(this)].sub(_amount);
    // Add amount to buyer's balance
    balances[_commodityId][_buyer] = balances[_commodityId][_buyer].add(_amount);

    // Manage commoditiesOwned array for escrow --
    // Check if user now owns 0 amount of that commodity
    if (balances[_commodityId][address(this)] == 0) {
      // If balance is zero, remove id from commoditiesOwned
      commoditiesOwned[address(this)].remove(_commodityId);
    }

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
