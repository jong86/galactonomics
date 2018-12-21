const CommodityReg = artifacts.require("./CommodityReg.sol")
const TransitAuthority = artifacts.require("./TransitAuthority.sol")
const CommodityEcon = artifacts.require("./CommodityEcon.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const deployCommodities = require('./util/deployCommodities')
const { fillUpCargoByMining, mineCommodityXTimes, getCommoditiesTraded, getRandomPlanetToSell } = require('./util/testUtils')

contract("CommodityEcon", accounts => {
  let transitAuthority, commodityEcon, gia, commodities, allCommodities, tradedOnPlanet
  const owner = accounts[0]
  const player1 = accounts[1]
  const player2 = accounts[2]
  const nonPlayer = accounts[3]
  const qty = 5
  const price = 20

  beforeEach(async() => {
    // Deploy individual commodity addresses
    allCommodities = await deployCommodities('0x00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
    const commodityAddresses = allCommodities.map(commodity => commodity.address)
    // Deploy main contracts
    commodities = await CommodityReg.new(commodityAddresses)
    transitAuthority = await TransitAuthority.new()
    commodityEcon = await CommodityEcon.new(commodities.address, transitAuthority.address)
    gia = await GalacticIndustrialAuthority.new(commodities.address, transitAuthority.address)
    // Set access roles
    await transitAuthority.setCommodityEcon(commodityEcon.address)
    await transitAuthority.setGIA(gia.address)
    allCommodities.forEach(async commodity => await commodity.setCommodityEcon(commodityEcon.address))
    allCommodities.forEach(async commodity => await commodity.setGIA(gia.address))

    const costOfSpaceship = await transitAuthority.costOfSpaceship()
    await transitAuthority.buySpaceship("A", { from: player1, value: costOfSpaceship })
    await transitAuthority.buySpaceship("B", { from: player2, value: costOfSpaceship })
    await transitAuthority.travelToPlanet(0, { from: player1 })
    await transitAuthority.travelToPlanet(0, { from: player2 })

    tradedOnPlanet = await getCommoditiesTraded(commodityEcon)
  })

  it("should let player1 create a sell order (w/ commodity deposited for escrow)", async () => {
    await mineCommodityXTimes(gia, 4, player1, 0)

    const planetToSell = getRandomPlanetToSell(0, tradedOnPlanet)

    const currentCargoBefore = await commodities.getCurrentCargo(player1)
    await transitAuthority.travelToPlanet(planetToSell, { from: player1 })
    const response = await commodityEcon.createSellOrder(planetToSell, 0, qty, price, { from: player1 })
    const currentCargoAfter = await commodities.getCurrentCargo(player1)

    assert.equal(
      currentCargoBefore.toString(),
      currentCargoAfter.add(qty).toString(),
      "cargo levels were not adjusted"
    )

    const { orderId } = response.logs[0].args
    const order = await commodityEcon.getSellOrder(planetToSell, 0, orderId)
    assert.equal(order[1], qty, 'did not create sell order')
    const balanceGEA = await allCommodities[0].balanceOf(commodityEcon.address)
    assert.equal(balanceGEA, qty, 'did not put commodity in escrow')
  })

  it("does not let a non-player make a sell-order", async () => {
    try {
      await commodityEcon.createSellOrder(0, 0, qty, price, { from: nonPlayer })
    } catch (e) {
      return assert(true)
    }
    assert(false, 'could create sell-order')
  })

  it("should let player2 buy player1's sell order", async () => {
    // Give player1 somethingt o sell
    await mineCommodityXTimes(gia, 4, player1, 0)

    // Get id of planet player1 can sell it at
    const planetToSell = getRandomPlanetToSell(0, tradedOnPlanet)

    // Create sell order on that planet
    await transitAuthority.travelToPlanet(planetToSell, { from: player1 })
    const response = await commodityEcon.createSellOrder(planetToSell, 0, qty, price, { from: player1 })
    const balanceGEA = await allCommodities[0].balanceOf(commodityEcon.address)

    const player1EthBefore = await web3.eth.getBalance(player1)
    const { orderId } = response.logs[0].args

    // Have player2 buy that sell order
    await transitAuthority.travelToPlanet(planetToSell, { from: player2 })
    await commodityEcon.buySellOrder(planetToSell, 0, orderId, { from: player2, value: qty * price })

    const currentCargoAfter = await commodities.getCurrentCargo(player2)
    assert.equal(currentCargoAfter.toString(), qty.toString(), "player2 did not have cargo adjusted")

    const balancePlayer2 = await allCommodities[0].balanceOf(player2)
    const player1EthAfter = await web3.eth.getBalance(player1)
    assert.equal(balancePlayer2, qty, 'player2 did not receive purchased amount of commodity')

    const tradeCost = web3.toBigNumber(qty * price)
    assert.equal(player1EthAfter.toString(), player1EthBefore.add(tradeCost).toString(), 'player1 did not receive payment')

    const order = await commodityEcon.getSellOrder(planetToSell, 0, orderId)
    assert(!order[3], "did not set open bool to false")

    assert.equal(order[4], player2, "did not record player2 as buyer")
  })

  it("should not let non-player buy player1's sell order", async () => {
    await mineCommodityXTimes(gia, 4, player1, 0)

    const planetToSell = getRandomPlanetToSell(0, tradedOnPlanet)

    await transitAuthority.travelToPlanet(planetToSell, { from: player1 })
    await commodityEcon.createSellOrder(planetToSell, 0, qty, price, { from: player1 })
    try {
      await commodityEcon.buySellOrder(planetToSell, orderId, { from: nonPlayer, value: qty * price })
    } catch (e) {
      return assert(true)
    }
    assert(false, "could buy sell-order")
  })

  it("should fail if player cannot fit the cargo they want to buy", async () => {
    // Fill up player2's cargo
    try {
      await fillUpCargoByMining(commodities, transitAuthority, gia, player2, 0)
    } catch (e) {
      return assert(false, e.toString())
    }
    // Find a amount of cargo that will max out player2's cargo
    const currentCargo = await commodities.getCurrentCargo(player2)
    const availableCargo = await transitAuthority.getAvailableCargo(player2, currentCargo)

    // Create a sell order with player1 that is too much cargo for player2
    const miningReward = await commodities.getMiningReward(0)
    const timesToMint = availableCargo.div(miningReward)
    try {
      await mineCommodityXTimes(gia, timesToMint.add(1), player1, 0)
    } catch (e) {
      return assert(false, e.toString())
    }

    const planetToSell = getRandomPlanetToSell(0, tradedOnPlanet)

    await transitAuthority.travelToPlanet(planetToSell, { from: player1 })
    const response = await commodityEcon.createSellOrder(planetToSell, 0, availableCargo.add(1), price, { from: player1 })

    const { orderId } = response.logs[0].args

    try {
      await commodityEcon.buySellOrder(planetToSell, orderId, { from: player2, value: qty * price })
    } catch (e) {
      return assert(true)
    }

    assert(false, "did not revert")
  })
})
