pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./utils/AccessControlled.sol";
import "./utils/CommodityInteractor.sol";
import "./utils/GTAInteractor.sol";

/**
 * @title Temple Authority
 * @notice This contract handles Byzantian Crystal creation and trading
 */
contract TempleAuthority is ERC721Full, CommodityInteractor, GTAInteractor {
  using SafeMath for uint;

  uint public constant forgingAmount = 10000; // units of each commodity

  constructor(address[] _commodityAddresses, address _gta)
  ERC721Full("ByzantianCrystals", "BZC")
  CommodityInteractor(_commodityAddresses)
  GTAInteractor(_gta)
  public {}


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

    // Mint one token for user
    uint _tokenId = totalSupply();
    _mint(msg.sender, _tokenId);

    // Set URI of token to something unique
    string memory _uri = bytes32ToString(keccak256(_tokenId, now, msg.sender));
    _setTokenURI(_tokenId, _uri);
  }

  /**
   * @notice Returns a list of all token IDs owned by an account
   * @param _owner Address of account to look up
   */
  function tokensOfOwner(address _owner) external returns (uint[] ownedTokens) {
    uint tokenCount = balanceOf(_owner);

    if (tokenCount == 0) {
      // Return an empty array
      return new uint[](0);
    } else {
      uint[] memory result = new uint[](tokenCount);
      uint totalCrystals = totalSupply();
      uint resultIndex = 0;

      for (uint crystalId = 0; crystalId <= totalCrystals; crystalId++) {
        if (ownerOf(crystalId) == _owner) {
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
   */
  function sell(uint _tokenId) external {

  }

  /**
   * @notice Purchase a crystal
   * @param _tokenId Id of crystal to purchase
   */
  function buy(uint _tokenId) external {

  }

  /**
   * @notice Helper function that converts a byte array to string
   * @param _data bytes32 to convert
   */
  function bytes32ToString(bytes32 _data) public pure returns (string) {
    bytes memory _s = new bytes(40);
    for (uint i = 0; i < 20; i++) {
      byte _b = byte(uint8(uint(_data) / (2**(8*(19 - i)))));
      byte _hi = byte(uint8(_b) / 16);
      byte _lo = byte(uint8(_b) - 16 * uint8(_hi));
      _s[2*i] = char(_hi);
      _s[2*i+1] = char(_lo);
    }
    return string(_s);
  }

  function char(byte _b) internal pure returns (byte c) {
    if (_b < 10) return byte(uint8(_b) + 0x30);
    else return byte(uint8(_b) + 0x57);
  }
}
