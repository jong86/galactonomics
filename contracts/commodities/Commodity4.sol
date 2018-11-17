pragma solidity ^0.4.24;

import "../Commodity.sol";

contract Commodity4 is Commodity {
  constructor() Commodity("Gold ore", "GLD") public {}
}