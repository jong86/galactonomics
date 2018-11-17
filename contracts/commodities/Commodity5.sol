pragma solidity ^0.4.24;

import "../Commodity.sol";

contract Commodity5 is Commodity {
  constructor() Commodity("Petroleum", "PET") public {}
}