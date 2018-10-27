pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract ControlledByGEAAndGIA is Ownable {
  address public gea;
  address public gia;

  event SetGEA(address gea);
  event SetGIA(address gia);

  modifier onlyGEA() {
    require(msg.sender == gea, "Only the Galactic Economic Authority may access this function");
    _;
  }

  modifier onlyGIA() {
    require(msg.sender == gia, "Only the Galactic Industrial Authority may access this function");
    _;
  }

  modifier onlyGEAOrGIA {
    require(
      msg.sender == gea || msg.sender == gia,
      "Only the Galactic Economic Authority or Galactic Industrial Authority may access this function"
    );
    _;
  }

  function setGEA(address _gea) public onlyOwner {
    gea = _gea;
    emit SetGEA(_gea);
  }

  function setGIA(address _gia) public onlyOwner {
    gia = _gia;
    emit SetGIA(_gia);
  }
}