pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./utils/AccessControlled.sol";
import "./libraries/AddressCast.sol";
import "./libraries/BytesCast.sol";
import "./libraries/UintCast.sol";
import "./libraries/Array256Lib.sol";
import "./interfaces/ICommodityReg.sol";

/**
 * @title CommodityInd
 *
 * @notice This contract manages mining of commodities
 */
contract CommodityInd is Ownable, AccessControlled {
  using SafeMath for uint;
  using AddressCast for address;
  using BytesCast for bytes32;
  using UintCast for uint;

  ICommodityReg commodityReg;

  // Mapping of commodityId to block number to bool indicating if commodity was mined in that block
  mapping (uint => mapping (uint => bool)) public wasMinedInBlock;

  event CommodityMined(bytes32 _hash, address _miner);
  event AlreadyMined(address _sender);

  constructor(address _commodityReg) {
    commodityReg = ICommodityReg(_commodityReg);
  }

  /**
   * @notice Verifies submitted POW and will trigger minting with CommodityReg on success
   * @param _nonce Value found that when sha256-hashed with the other params used in the code, results in an
   *  acceptable hash value less than the target difficulty for the commodity
   * @param _commodityId Id of commodity that you mined
   * @param _blockNumber blockNumber of hash used
   */
  function submitPOW(uint _nonce, uint _commodityId, uint _blockNumber) external {
    require(block.number - _blockNumber <= 10, "You can only mine for a block at most 10 blocks in the past")
    
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
        msg.sender.toString(),
        uint256(block.blockhash(blockNumber)).toString()
      )
    );

    // Check if hash is valid
    uint _miningTarget = getMiningTarget(_commodityId);
    require(uint(_hash) < _miningTarget, "That proof-of-work is not valid");

    // Flag to prevent more than one miner to claim reward per block, per commodity
    wasMinedInBlock[_commodityId][block.number] = true;

    // Invoke minting of commodity for miner
    uint _miningReward = getMiningReward(_commodityId);
    require(commodityReg.mint(msg.sender, _commodityId, _miningReward), "Error minting commodity");

    emit CommodityMined(_hash, msg.sender);
  }

  /**
   * @notice Returns data used for mining
   * @param _id Id of commodity
   */
  function getMiningData(uint _id) public view returns (uint miningReward, uint miningTarget) {
    return (getMiningReward(_id), getMiningTarget(_id));
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

  function() public {}
}
