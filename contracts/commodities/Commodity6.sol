pragma solidity ^0.4.24;

import "../Commodity.sol";

contract Commodity6 is Commodity {
  constructor() Commodity("Water", "WTR") public {}
}