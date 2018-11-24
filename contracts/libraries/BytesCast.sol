pragma solidity ^0.4.24;

library BytesCast {
  /**
   * @notice Helper function that converts a byte array to string
   */
  function toString(bytes32 _data) internal pure returns (string memory) {
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