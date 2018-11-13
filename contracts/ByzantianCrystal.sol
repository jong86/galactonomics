pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./utils/AccessControlled.sol";

/**
 * @title Byzantian Crystal
 *
 * @notice Non-fungible ERC-721 tokens
 */
contract ByzantianCrystal is ERC721Full, AccessControlled {
  using SafeMath for uint;

  constructor()
  ERC721Full("ByzantianCrystals", "BZC")
  public {}

  /**
   * @notice Create a new token for specified address
   * @return Newly created token ID
   */
  function create(address _for) external onlyTA returns (uint) {
    // Mint one token for user
    uint _tokenId = totalSupply() + 1;
    _mint(_for, _tokenId);

    // Set URI of token to something unique
    string memory _uri = bytes32ToString(keccak256(_tokenId, now, _for));
    _setTokenURI(_tokenId, _uri);

    return _tokenId;
  }

  /**
   * @notice Transfers token from seller to Temple Authority
   * @param _from Address of seller
   * @param _tokenId Token ID to transfer
   */
  function transferToEscrow(address _from, uint _tokenId) external onlyTA {
    _removeTokenFrom(_from, _tokenId);
    _addTokenTo(taAddress, _tokenId);
    emit Transfer(_from, taAddress, _tokenId);
  }

  /**
   * @notice Transfers token from Temple Authority to specified address
   * @param _to Address to transfer token
   * @param _tokenId Token ID to transfer
   */
  function transferFromEscrow(address _to, uint _tokenId) external onlyTA {
    _removeTokenFrom(taAddress, _tokenId);
    _addTokenTo(_to, _tokenId);
    emit Transfer(taAddress, _to, _tokenId);
  }

  /**
   * @notice Helper function that converts a byte array to string
   * @param _data bytes32 to convert
   */
  function bytes32ToString(bytes32 _data) private pure returns (string) {
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

  function char(byte _b) private pure returns (byte c) {
    if (_b < 10) return byte(uint8(_b) + 0x30);
    else return byte(uint8(_b) + 0x57);
  }
}
