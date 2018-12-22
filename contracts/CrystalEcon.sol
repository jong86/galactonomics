pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./interfaces/ICrystal.sol";
import "./interfaces/ICommodityReg.sol";

/**
 * @title CrystalEcon
 *
 * @notice The contract handles crystal forging and trading
 */
contract CrystalEcon {
  using SafeMath for uint;

  ICrystal crystal;
  ICommodityReg commodityReg;

  // Array storing IDs of all crystals that are for sale
  uint[] public crystalsForSale;

  // Mapping of token IDs to SellData struct
  mapping(uint => SellData) tokenIdToSellData;

  struct SellData {
    address seller;
    uint price;
  }

  constructor(address _commodityReg, address _crystal) public {
    commodityReg = ICommodityReg(_commodityReg);
    crystal = ICrystal(_crystal);
  }

  /**
   * @notice Put a crystal up for sale
   * @param _tokenId Id of crystal to sell
   * @param _price Price in wei to sell crystal for
   */
  function sell(uint _tokenId, uint _price) external {
    require(crystal.ownerOf(_tokenId) == msg.sender, "You cannot sell a crystal you do not own");

    // Add crystal to list of crystals for sale
    crystalsForSale.push(_tokenId);
    // Store seller address and price in mapping
    tokenIdToSellData[_tokenId] = SellData(msg.sender, _price);
    // Transfer token from owner to this contract (acting as escrow)
    crystal.transferToEscrow(msg.sender, _tokenId);
  }

  /**
   * @notice Purchase a crystal
   * @param _tokenId Id of crystal to purchase
   */
  function buy(uint _tokenId) external payable {
    require(msg.value == tokenIdToSellData[_tokenId].price, "You did not provide the correct amount of ether");

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

    // Transfer money to seller
    tokenIdToSellData[_tokenId].seller.transfer(msg.value);
    // Transfer token ownership to buyer
    crystal.transferFromEscrow(msg.sender, _tokenId);
  }

  /**
   * @notice Getter function for crystalsForSale array
   */
  function getCrystalsForSale() external view returns (uint[]) {
    return crystalsForSale;
  }

  /**
   * @notice Returns seller and price of crystal that is for sale
   * @param _tokenId Address of account to look up
   */
  function getCrystalSellData(uint _tokenId) external view returns (address seller, uint price) {
    SellData memory sellData = tokenIdToSellData[_tokenId];
    return (sellData.seller, sellData.price);
  }

  function() external payable {}
}
