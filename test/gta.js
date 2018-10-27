const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const deployCommodities = require('../util/deployCommodities')

contract("GalacticTransitAuthority", accounts => {
  let gta
  const owner = accounts[0]
  const player1 = accounts[1]
  const player2 = accounts[2]
  const nonPlayer = accounts[3]

  beforeEach(async() => {
    commodities = await deployCommodities()
    const commodityAddresses = commodities.map(commodity => commodity.address)
    gta = await GalacticTransitAuthority.new()
    gea = await GalacticEconomicAuthority.new(commodityAddresses, gta.address)
    gia = await GalacticIndustrialAuthority.new(commodityAddresses, gta.address)
    await gta.setGEA(gea.address)
    await gta.setGIA(gia.address)
    commodities.forEach(async commodity => await commodity.setGEA(gea.address))
    commodities.forEach(async commodity => await commodity.setGIA(gia.address))
  })

  it("should allow user to buy a spaceship", async () => {
    const response = await gta.buySpaceship('Millenium Falcon', { from: player1 })
    const { tokenId } = response.logs[0].args
    const spaceshipOwner = await gta.ownerOf(tokenId)
    assert.equal(player1, spaceshipOwner, 'could not buy')
  })

  it("should only let users buy one spaceship", async () => {
    await gta.buySpaceship('Millenium Falcon', { from: player1 })
    try {
      await gta.buySpaceship('Millenium Falcon2', { from: player1 })
    } catch (e) {
      return assert(true)
    }
    assert(false, 'could buy a second spaceship')
  })

  it("should allow a player to travel to other planets", async () => {
    await gta.buySpaceship('Millenium Falcon', { from: player1 })
    await gta.travelToPlanet(1, { from: player1 })
    const response = await gta.getInfo({ from: player1 })
    assert.equal(response[1].toString(), "1", "didn't change planet")
  })

  it("travelling to a planet uses fuel", async () => {
    await gta.buySpaceship('Millenium Falcon', { from: player1 })
    let checkFuel = await gta.checkFuel(player1)
    const fuelBefore = checkFuel[0]
    await gta.travelToPlanet(1, { from: player1 })
    checkFuel = await gta.checkFuel(player1)
    const fuelAfter = checkFuel[0]
    assert(fuelBefore.cmp(fuelAfter) === 1, "does not have less fuel")
  })

  it("cannot travel to planet if there is not enough fuel", async () => {
    await gta.buySpaceship('Millenium Falcon', { from: player1 })
    await gta.travelToPlanet(1, { from: player1 })
    await gta.travelToPlanet(1, { from: player1 })
    await gta.travelToPlanet(1, { from: player1 })
    try {
      await gta.travelToPlanet(1, { from: player1 })
    } catch (e) {
      return assert(true)
    }
    assert(false, "could still travel")
  })

  it("can refuel spaceship", async () => {
    await gta.buySpaceship('Millenium Falcon', { from: player1 })
    await gta.travelToPlanet(1, { from: player1 })
    let checkFuel = await gta.checkFuel(player1)
    const fuelBefore = checkFuel[0]
    const maxFuel = checkFuel[1]
    const refuelCost = await gta.refuelCost()
    await gta.refuel({ from: player1, value: refuelCost })
    checkFuel = await gta.checkFuel(player1)
    const fuelAfter = checkFuel[0]
    assert(fuelBefore.cmp(fuelAfter) === -1, "currentFuel after refuel is not more than before refuel")
    assert.equal(fuelAfter.toString(), maxFuel.toString(), "currentFuel after refuel is not equal to maxFuel")
  })

  it("cannot refuel spaceship if no ether supplied", async () => {
    await gta.buySpaceship('Millenium Falcon', { from: player1 })
    await gta.travelToPlanet(1, { from: player1 })
    try {
      await gta.refuel({ from: player1 })
    } catch (e) {
      return assert(true)
    }
    assert(false, "no error when trying to refuel")
  })

  it("cannot refuel spaceship if not enough ether supplied", async () => {
    await gta.buySpaceship('Millenium Falcon', { from: player1 })
    await gta.travelToPlanet(1, { from: player1 })
    const refuelCost = await gta.refuelCost()
    try {
      await gta.refuel({ from: player1, value: refuelCost.sub(1) })
    } catch (e) {
      return assert(true)
    }
    assert(false, "no error when trying to refuel")
  })

  it("should error if player tries to travel to a planet that doesn't exist", async () => {
    let errorCount = 0
    await gta.buySpaceship('Millenium Falcon', { from: player1 })
    try {
      await gta.travelToPlanet(7, { from: player1 })
    } catch (e) {
      errorCount++
    }
    try {
      await gta.travelToPlanet(-1, { from: player1 })
    } catch (e) {
      errorCount++
    }
    assert(errorCount === 2, "did not error properly")
  })
})
