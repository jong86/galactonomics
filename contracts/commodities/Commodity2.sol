pragma solidity ^0.4.24;

import "../Commodity.sol";

contract Commodity2 is Commodity {
  constructor() Commodity("Dark Matter", "DKM") public {}
}