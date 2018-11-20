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

  event Log(string msg);
  event Hash(bytes32 hsh);
  event Nonce(string nonce);

  /**
   * @notice Mints new commodity tokens for a player
   * @param _nonce Value found that when hashed (using SHA-256) with the previous proof-of-work hash found for a
   *  specified commodity, results in an acceptable hash according to current difficulty for that commodity
   * @param _commodityId Commodity to mint
   */
  function submitProofOfWork(string _nonce, uint8 _commodityId) external {
    require(gta.isPlayer(msg.sender), "You must own a spaceship for this action");
    require(gta.getCurrentPlanet(msg.sender) == _commodityId, "You are not on the correct planet");

    bytes32 _hash = sha256(_nonce);
    emit Hash(_hash);
    emit Nonce(_nonce);

    if (_hash < commodities.getMiningTarget(_commodityId)) {
      emit Log("you win");
    }
  }

  function() public {}
}
