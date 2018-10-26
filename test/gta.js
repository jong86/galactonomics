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
    const response = await gta.buySpaceship('Millenium Falcon', { from: alice })
    const { tokenId } = response.logs[0].args
    const spaceshipOwner = await gta.ownerOf(tokenId)
    assert.equal(alice, spaceshipOwner, 'could not buy')
  })

  it("should only let users buy one spaceship", async () => {
    const response = await gta.buySpaceship('Millenium Falcon', { from: alice })

    try {
      const response2 = await gta.buySpaceship('Millenium Falcon2', { from: alice })
    } catch (e) {
      return assert(true)
    }

    assert(false, 'could buy a second spaceship')
  })

  it("should allow a player to travel to other planets", async () => {
    const response = await gta.buySpaceship('Millenium Falcon', { from: alice })
    const { tokenId } = response.logs[0].args
    await gta.travelToPlanet(1, { from: alice })
    const response2 = await gta.getInfo({ from: alice })
    assert.equal(response2[1].toString(), "1", "didn't change planet")
  })

  it("should error if player tries to travel to a planet that doesn't exist", async () => {
    let errorCount = 0
    const response = await gta.buySpaceship('Millenium Falcon', { from: alice })
    const { tokenId } = response.logs[0].args
    try {
      await gta.travelToPlanet(7, { from: alice })
    } catch (e) {
      errorCount++
    }
    try {
      await gta.travelToPlanet(-1, { from: alice })
    } catch (e) {
      errorCount++
    }
    assert(errorCount === 2, "did not error properly")
  })
})
