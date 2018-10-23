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

  it("...should store the value 89.", async () => {
    // Set value of 89
    await gia.set(89, { from: bob });

    // Get stored value
    const storedData = await gia.get.call();

    assert.equal(storedData, 89, "The value 89 was not stored.");
  });
});
