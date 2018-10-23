const GalacticCentralAuthority = artifacts.require("./GalacticCentralAuthority.sol");
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol");

contract("GalacticIndustrialAuthority", accounts => {
  let gia
  const owner = accounts[0]
  const alice = accounts[1]
  const bob = accounts[2]
  const eve = accounts[3]

  beforeEach(async() => {
    gia = await GalacticIndustrialAuthority.new({ from: owner });
  })

  it("should deploy 7 commodity contracts", async () => {

  });

  it("should allow owner to mint commodities for another account", async () => {

  });

  it("should fail with revert error if a non-owner tries to mint commodities", async () => {

  });
});
