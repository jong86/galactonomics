pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./interfaces/IGalacticTransitAuthority.sol";
import "./interfaces/ICommodities.sol";

/**
 * @title Galactic Industrial Authority (GIA)
 *
 * @notice The GIA handles commodity-mining
 */
contract GalacticIndustrialAuthority {
  using SafeMath for uint;

  IGalacticTransitAuthority gta;
  ICommodities commodities;

  constructor(address _commodities, address _gta) public {
    commodities = ICommodities(_commodities);
    gta = IGalacticTransitAuthority(_gta);
  }

  /**
   * @notice Mints new commodity tokens for a player
   * @param _nonce Value found that when hashed (using SHA-256) with the previous proof-of-work hash found for a
   *  specified commodity, results in an acceptable hash according to current target for that commodity
   */
  function submitProofOfWork(string _nonce) external {
    require(gta.isPlayer(msg.sender), "You must own a spaceship for this action");

    uint8 _commodityId = gta.getCurrentPlanet(msg.sender);

    bytes32 _hash = sha256(abi.encodePacked(_nonce));
    require(_hash < commodities.getMiningTarget(_commodityId), "That is not a valid proof-of-work");

    require(commodities.getInterface(_commodityId).dispenseReward(msg.sender), "Error minting");
  }

  function() public {}
}
