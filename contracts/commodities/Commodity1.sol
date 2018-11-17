pragma solidity ^0.4.24;

import "../Commodity.sol";

contract Commodity1 is Commodity {
  constructor() Commodity("Neon gas", "NEG") public {}
}