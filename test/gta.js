const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const deployCommodities = require('../util/deployCommodities')

contract("GalacticTransitAuthority", accounts => {
  let gta, commodities
  const owner = accounts[0]
  const alice = accounts[1]
  const bob = accounts[2]
  const eve = accounts[3]

  beforeEach(async() => {
    commodities = await deployCommodities()
    const commodityAddresses = commodities.map(commodity => commodity.address)
    gta = await GalacticTransitAuthority.new()
  })

  it("should allow user to buy a spaceship", async () => {
    const response = await gta.buySpaceship({ from: alice })
    const { tokenId } = response.logs[0].args
    const spaceshipOwner = await gta.ownerOf(tokenId)
    assert.equal(alice, spaceshipOwner, 'could not buy')
  })
})
