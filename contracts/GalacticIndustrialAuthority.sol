pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./interfaces/IGalacticTransitAuthority.sol";
import "./interfaces/ICommodities.sol";
import "./libraries/AddressCast.sol";
import "./libraries/BytesCast.sol";
import "./libraries/UintCast.sol";

/**
 * @title Galactic Industrial Authority (GIA)
 *
 * @notice The GIA handles commodity-mining
 */
contract GalacticIndustrialAuthority {
  using SafeMath for uint;
  using AddressCast for address;
  using BytesCast for bytes32;
  using UintCast for uint8;
  using UintCast for uint;

  IGalacticTransitAuthority gta;
  ICommodities commodities;

  constructor(address _commodities, address _gta) public {
    commodities = ICommodities(_commodities);
    gta = IGalacticTransitAuthority(_gta);
  }

  event CommodityMined(bytes32 _hash, address miner);

  /**
   * @notice Mints new commodity tokens for a player
   * @param _nonce Value found that when hashed (using SHA-256) with the previous proof-of-work hash found for a
   *  commodity, results in an acceptable hash according to current target for that commodity
   */
  function submitProofOfWork(string _nonce) external {
    require(gta.isPlayer(msg.sender), "You must own a spaceship for this action");
    uint8 _commodityId = gta.getCurrentPlanet(msg.sender);

    string memory _prevHash = commodities.getInterface(_commodityId).prevMiningHash().toString();

    bytes32 _hash = sha256(
      abi.encodePacked(
        _nonce,
        _commodityId.toString(),
        _prevHash,
        msg.sender.toString(),
        block.number.toString()
      )
    );

    require(commodities.getInterface(_commodityId).dispenseReward(msg.sender, _hash), "Error doing reward");
    emit CommodityMined(_hash, msg.sender);
  }

  /**
   * @notice Returns all data required for mining
   */
  function getMiningData() external view returns (
    uint miningReward,
    bytes32 miningTarget,
    string prevHash,
    uint blockNumber
  ) {
    uint8 _commodityId = gta.getCurrentPlanet(msg.sender);

    return (
      commodities.getInterface(_commodityId).miningReward(),
      commodities.getInterface(_commodityId).miningTarget(),
      commodities.getInterface(_commodityId).prevMiningHash().toString(),
      block.number
    );
  }

  function() public {}
}
