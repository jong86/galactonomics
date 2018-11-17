pragma solidity ^0.4.24;

import "../Commodity.sol";

contract Commodity3 is Commodity {
  constructor() Commodity("Platinum ore", "PLT") public {}
}