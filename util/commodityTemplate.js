const template = (name, symbol) => `
  pragma solidity ^0.4.24;

  import "../Commodity.sol";

  contract ${name} is Commodity {
    constructor() Commodity("${name}", "${symbol}") {}
  }
`

module.exports = template
