const Commodities = artifacts.require("./Commodities.sol")
const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const deployCommodities = require('./util/deployCommodities')

contract("GalacticTransitAuthority", accounts => {
  let gta, costOfSpaceship, commodities
  const owner = accounts[0]
  const player1 = accounts[1]
  const player2 = accounts[2]
  const nonPlayer = accounts[3]

  beforeEach(async() => {
    // Deploy individual commodity addresses
    const allCommodities = await deployCommodities()
    const commodityAddresses = allCommodities.map(commodity => commodity.address)
    // Deploy main contracts
    commodities = await Commodities.new(commodityAddresses)
    gta = await GalacticTransitAuthority.new()
    gea = await GalacticEconomicAuthority.new(commodities.address, gta.address)
    gia = await GalacticIndustrialAuthority.new(commodities.address, gta.address)
    await gta.setGEA(gea.address)
    await gta.setGIA(gia.address)
    allCommodities.forEach(async commodity => await commodity.setGEA(gea.address))
    allCommodities.forEach(async commodity => await commodity.setGIA(gia.address))

    costOfSpaceship = await gta.costOfSpaceship()
  })

  it("should allow user to buy a spaceship", async () => {
    const response = await gta.buySpaceship('Millenium Falcon', { from: player1, value: costOfSpaceship })
    const { tokenId } = response.logs[0].args
    const spaceshipOwner = await gta.ownerOf(tokenId)
    assert.equal(player1, spaceshipOwner, 'could not buy')
  })

  it("buying a spaceship without correct amount of ether in transaction will fail", async () => {
    try {
      await gta.buySpaceship('Millenium Falcon', { from: player1, value: costOfSpaceship.sub(1) })
    } catch (e) {
      return assert(true)
    }
    assert(false, "did not fail")
  })

  it("should only let users buy one spaceship (for now)", async () => {
    await gta.buySpaceship('Millenium Falcon', { from: player1, value: costOfSpaceship })
    try {
      await gta.buySpaceship('Millenium Falcon2', { from: player1 })
    } catch (e) {
      return assert(true)
    }
    assert(false, 'could buy a second spaceship')
  })

  it("should allow a player to travel to the planets with ids 0 to 6, inclusive", async () => {
    await gta.buySpaceship('Millenium Falcon', { from: player1, value: costOfSpaceship })
    for (let i = 0; i < 7; i++) {
      await gta.travelToPlanet(i, { from: player1 })
      const response = await gta.getInfo({ from: player1 })
      assert.equal(response[1].toString(), i.toString(), "didn't change planet")

      const refuelCost = await gta.refuelCost()
      await gta.refuel({ from: player1, value: refuelCost })
    }
  })

  it("should allow a player to travel to the planet with id 255", async () => {
    await gta.buySpaceship('Millenium Falcon', { from: player1, value: costOfSpaceship })
    await gta.travelToPlanet(255, { from: player1 })
    const response = await gta.getInfo({ from: player1 })
    assert.equal(response[1].toString(), (255).toString(), "didn't change planet")
  })

  it("travelling to a planet uses fuel", async () => {
    await gta.buySpaceship('Millenium Falcon', { from: player1, value: costOfSpaceship })
    let checkFuel = await gta.checkFuel(player1)
    const fuelBefore = checkFuel[0]
    await gta.travelToPlanet(1, { from: player1 })
    checkFuel = await gta.checkFuel(player1)
    const fuelAfter = checkFuel[0]
    assert(fuelBefore.cmp(fuelAfter) === 1, "does not have less fuel")
  })

  it("cannot travel to planet if there is not enough fuel", async () => {
    await gta.buySpaceship('Millenium Falcon', { from: player1, value: costOfSpaceship })
    await gta.travelToPlanet(1, { from: player1 })
    await gta.travelToPlanet(1, { from: player1 })
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
    await gta.buySpaceship('Millenium Falcon', { from: player1, value: costOfSpaceship })
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
    await gta.buySpaceship('Millenium Falcon', { from: player1, value: costOfSpaceship })
    await gta.travelToPlanet(1, { from: player1 })
    try {
      await gta.refuel({ from: player1 })
    } catch (e) {
      return assert(true)
    }
    assert(false, "no error when trying to refuel")
  })

  it("cannot refuel spaceship if not enough ether supplied", async () => {
    await gta.buySpaceship('Millenium Falcon', { from: player1, value: costOfSpaceship })
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
    await gta.buySpaceship('Millenium Falcon', { from: player1, value: costOfSpaceship })
    try {
      await gta.travelToPlanet(7, { from: player1 })
    } catch (e) {
      errorCount++
    }
    try {
      await gta.travelToPlanet(128, { from: player1 })
    } catch (e) {
      errorCount++
    }
    assert(errorCount === 2, "did not error properly")
  })

  it("allows user to get planet's URI", async () => {
    const num1 = '1042'
    const uri1 = await gta.planetURI(num1, { from: player1 })
    assert.equal(uri1, '0x216da54b5931a6d37cca8e29953361fe02c680bbd8b482343f508e32e8e9cc3b', 'returned wrong hash for num1')

    const num2 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
    const uri2 = await gta.planetURI(num2, { from: player1 })
    assert.equal(uri2, '0xf071ee960e2f5f0391c4fc4d5877f62a9c74ade164e8981c8c830f4fe2a16ee0', 'returned wrong hash for num2')
  })
})
