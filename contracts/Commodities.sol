pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./libraries/AddressCast.sol";
import "./libraries/BytesCast.sol";
import "./libraries/UintCast.sol";

/**
 * @title Commodities
 *
 * @notice This contracts is for convenient access to the commodities
 */
contract Commodities is Ownable {
  using SafeMath for uint;
  using AddressCast for address;
  using BytesCast for bytes32;
  using UintCast for uint8;
  using UintCast for uint;

  IGalacticTransitAuthority gta;

  // Mapping of commodityId to address to amount of commodity owned
  mapping (uint => mapping (address => uint)) balances;

  // Mapping of address to array containing Ids of commodities owned (for iterating)
  mapping (address => uint[]) commoditiesOwned;

  // Mapping of commodityId to previous mining hash
  mapping (uint => bytes32) prevMiningHashes;

  constructor(address _gta) public {
    gta = IGalacticTransitAuthority(_gta);
  }

  event CommodityMined(bytes32 _hash, address _miner);

  /**
   * @notice Mints new commodity tokens for a player
   * @param _nonce Value found that when hashed (using SHA-256) with the previous proof-of-work hash found for a
   *  commodity, results in an acceptable hash according to current target for that commodity
   */
  function mine(string _nonce) external {
    require(gta.isPlayer(msg.sender), "You must own a spaceship for this action");
    uint8 _commodityId = gta.getCurrentPlanet(msg.sender);
    require(
      gta.canFitCargo(
        msg.sender,
        getCurrentCargo(msg.sender),
        getMiningReward(_commodityId)
      ),
      "Not enough cargo capacity available on your ship, you must unload cargo by selling it"
    );

    string memory _prevHash = prevMiningHashes[_commodityId].toString();

    bytes32 _hash = sha256(
      abi.encodePacked(
        _nonce,
        _commodityId.toString(),
        _prevHash,
        msg.sender.toString()
      )
    );

    require(mint(msg.sender, getMiningReward(_commodityId)), "Error sending reward");
    emit CommodityMined(_hash, msg.sender);
  }

  /**
   * @notice Returns total cargo stored on player's ship
   * @param _player Address of player to look up
   */
  function getCurrentCargo(address _player) external view returns (uint) {
    uint currentCargo;
    for (uint i = 0; i < commoditiesOwned[_player].length; i++) {
      uint cargoToAdd = commoditiesOwned[_player][i];
      currentCargo = currentCargo.add(cargoToAdd);
    }
    return currentCargo;
  }

  /**
   * @notice Returns data on a commodity
   * @param _id Id of commodity
   */
  function getCommodity(uint _id) external view returns (
    string name,
    uint balance,
    uint miningReward,
    bytes32 miningTarget,
    bytes32 prevMiningHash
  ) {
    return (
      getName(_id),
      balances[_id][msg.sender],
      getMiningReward(_id),
      getMiningTarget(_id),
      prevMiningHashes[_id]
    );
  }

  /**
   * @notice Returns URI of a commodity
   * @param _id Id of commodity
   */
  function getURI(uint _id) public view returns (string) {
    return sha256(abi.encodePacked(_id.toString()));
  }

  /**
   * @notice Returns mining reward of a commodity
   * @param _id Id of commodity
   */
  function getMiningReward(uint _id) public view returns (uint) {
    return 10;
  }

  /**
   * @notice Returns mining target of a commodity
   * @param _id Id of commodity
   */
  function getMiningTarget(uint _id) public view returns (bytes32) {
    return sha256("0");
  }

  /**
   * @notice Returns amount of commodity the player owns
   * @param _id Id of commodity
   */
  function getBalance(uint _id) public view returns (uint) {
    return balances[_id][msg.sender];
  }

  function() public {}
}
