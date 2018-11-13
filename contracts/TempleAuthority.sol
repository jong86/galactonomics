pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./utils/CommodityInteractor.sol";
import "./utils/GTAInteractor.sol";
import "./interfaces/IByzantianCrystal.sol";

/**
 * @title Temple Authority
 * @notice This contract handles Byzantian Crystal forging and trading
 */
contract TempleAuthority is CommodityInteractor, GTAInteractor {
  using SafeMath for uint;

  IByzantianCrystal bCrystal;

  // Units of each commodity required to forge a crystal
  uint public constant forgingAmount = 10000;

  // Array storing IDs of all crystals that are for sale
  uint[] public crystalsForSale;

  // Mapping of token IDs to sale price
  mapping(uint => uint) tokenIdToPrice;

  constructor(address[] _commodityAddresses, address _gta, address _bCrystal)
  CommodityInteractor(_commodityAddresses)
  GTAInteractor(_gta)
  public {
    bCrystal = IByzantianCrystal(_bCrystal);
  }

  /**
   * @notice Creates a new crystal, requires forgingAmount in all 7 commodities
   * @dev Burns a quantity of all 7 of an account's commodities
   * @return tokenId of newly created crystal
   */
  function forge() external onlyPlayer samePlanet(255) returns (uint) {
    uint i;

    // Check balance of every commodity to make sure there is enough
    for (i = 0; i <= 6; i++) {
      require(
        commodities[i]._interface.balanceOf(msg.sender) >= forgingAmount,
        "You do not have enough commodities to forge"
      );
    }

    // Burn x amount of all 7 of user's commodities
    for (i = 0; i <= 6; i++) {
      require(
        commodities[i]._interface.burn(msg.sender, forgingAmount),
        "Error burning commodity"
      );
    }

    uint _tokenId = bCrystal.create(msg.sender);
    return _tokenId;
  }

  /**
   * @notice Returns a list of all token IDs owned by an account
   * @param _owner Address of account to look up
   */
  function crystalsOfOwner(address _owner) external view returns (uint[] ownedCrystals) {
    uint tokenCount = bCrystal.balanceOf(_owner);

    if (tokenCount == 0) {
      // Return an empty array
      return new uint[](0);
    } else {
      uint[] memory result = new uint[](tokenCount);
      uint totalCrystals = bCrystal.totalSupply();
      uint resultIndex = 0;
      uint crystalId;

      for (crystalId = 1; crystalId <= totalCrystals; crystalId++) {
        if (bCrystal.ownerOf(crystalId) == _owner) {
          result[resultIndex] = crystalId;
          resultIndex++;
        }
      }

      return result;
    }
  }

  /**
   * @notice Put a crystal up for sale
   * @param _tokenId Id of crystal to sell
   * @param _price Price in wei to sell crystal for
   */
  function sell(uint _tokenId, uint _price) external {
    require(bCrystal.ownerOf(_tokenId) == msg.sender, "You cannot sell a crystal you do not own");

    // Add crystal to list of crystals for sale
    crystalsForSale.push(_tokenId);
    // Store price in a mapping
    tokenIdToPrice[_tokenId] = _price;
    // Transfer token from owner to this contract (acting as escrow)
    bCrystal.transferToEscrow(msg.sender, _tokenId);
  }

  /**
   * @notice Purchase a crystal
   * @param _tokenId Id of crystal to purchase
   */
  function buy(uint _tokenId) external payable {
    require(msg.value == tokenIdToPrice[_tokenId], "You did not provide the correct amount of ether");

    // Remove crystal from list of crystals for sale
    uint numForSale = crystalsForSale.length;
    for (uint i = 0; i < numForSale; i++) {
      if (crystalsForSale[i] == _tokenId) {
        // If in here then we found the index this token is at, now for array management:
        // Move last crystal in list to bought token's spot
        crystalsForSale[i] = crystalsForSale[numForSale - 1];
        // Delete last item
        delete crystalsForSale[numForSale - 1];
        // Shorten list of crystals for sale by 1
        crystalsForSale.length--;
        break;
      }
    }

    // Transfer token ownership to buyer
    bCrystal.transferFromEscrow(msg.sender, _tokenId);
  }

  /**
   * @notice Getter function for crystalsForSale array
   */
  function getCrystalsForSale() external view returns (uint[]) {
    return crystalsForSale;
  }

  function() external payable {}
}
