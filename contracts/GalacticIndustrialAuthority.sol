pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./items/Commodity.sol";
import "./interfaces/IGalacticTransitAuthority.sol";
import "./interfaces/ICommodities.sol";

/**
 * @title Galactic Industrial Authority (GIA)
 *
 * @notice The GIA handles commodity-mining investments, and minting
 */
contract GalacticIndustrialAuthority is Ownable {
  using SafeMath for uint;

  IGalacticTransitAuthority gta;
  ICommodities commodities;

  struct Investment {
    uint8 commodityId;
    uint blocksLeft;
  }

  mapping(address => Investment) investments;

  event InvestmentMade(address addr, uint blocksLeft);
  event CommodityMinted(address to, uint blocksLeft);

  event Hash(bytes32 data);

  constructor(address _commodities, address _gta) public {
    commodities = ICommodities(_commodities);
    gta = IGalacticTransitAuthority(_gta);
  }


  // Action functions

  function investInProduction(uint8 _commodityId) external payable {
    require(gta.isPlayer(msg.sender), "You must own a spaceship for this action");
    require(gta.getCurrentPlanet(msg.sender) == _commodityId, "You are not on the correct planet");
    require(
      gta.canFitCargo(msg.sender, commodities.getCurrentCargo(msg.sender),
      getTotalProductionReturns(_commodityId)),
      "Not enough cargo space"
    );
    require(msg.value == commodities.getMiningCost(_commodityId), "You have not provided enough ether");
    require(investments[msg.sender].blocksLeft == 0, "You can only mine one commodity at a time");

    uint _miningDuration = commodities.getMiningDuration(_commodityId);
    investments[msg.sender] = Investment(_commodityId, _miningDuration);
    emit InvestmentMade(msg.sender, _miningDuration);
  }

  function mintCommodityFor(address _for) external onlyOwner {
    require(investments[_for].blocksLeft > 0, "There are no more blocks left to mine for this investment");

    investments[_for].blocksLeft = investments[_for].blocksLeft.sub(1);
    uint8 _commodityId = investments[_for].commodityId;
    // Only mint what can fit on player's ship
    uint amountToMint = commodities.getAmountMinedPerBlock(_commodityId);
    uint availableCargo = gta.getAvailableCargo(_for, commodities.getCurrentCargo(_for));
    if (amountToMint >= availableCargo) {
      amountToMint = availableCargo;
    }
    commodities.getInterface(_commodityId).mint(_for, amountToMint);
    emit CommodityMinted(_for, investments[_for].blocksLeft);
  }

  /**
   * @notice Mints new commodity tokens for a player
   * @param _nonce Value found that when hashed (using SHA-256) with the previous proof-of-work hash found for a
   *  specified commodity, results in an acceptable hash according to current difficulty for that commodity
   * @param _commodityId Commodity to mint
   */
  function submitProofOfWork(string _nonce, uint8 _commodityId) external {
    require(gta.isPlayer(msg.sender), "You must own a spaceship for this action");
    require(gta.getCurrentPlanet(msg.sender) == _commodityId, "You are not on the correct planet");
    
    bytes32 _hash = sha256(abi.encodePacked(_nonce));
    emit Hash(_hash);
  }


  // View functions

  function getTotalProductionReturns(uint8 _commodityId) public view returns (uint) {
    return commodities.getAmountMinedPerBlock(_commodityId).mul(
      commodities.getMiningDuration(_commodityId)
    );
  }

  function getInvestment(address _address) public view returns (uint8 commodityId, uint blocksLeft) {
    return (investments[_address].commodityId, investments[_address].blocksLeft);
  }

  function() public {}
}
