pragma solidity ^0.4.24;

library AddressCast {
  function toString(address self) internal pure returns (string memory) {
    bytes memory str = new bytes(40);

    for (uint i = 0; i < 20; i++) {
      byte strb = byte(uint8(uint(self) / (2**(8*(19 - i)))));

      byte hi = byte(uint8(strb) / 16);
      byte lo = byte(uint8(strb) - 16 * uint8(hi));

      str[2*i] = char(hi);
      str[2*i+1] = char(lo);
    }

    return string(str);
  }

  function char(byte b) internal pure returns (byte c) {
    if (b < 10) return byte(uint8(b) + 0x30);
    else return byte(uint8(b) + 0x57);
  }
}