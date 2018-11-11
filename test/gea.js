const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const deployCommodities = require('../utils/deployCommodities')
const { fillUpCargoByMinting, mintCommodityXTimes } = require('./util/testUtils')

contract("GalacticEconomicAuthority", accounts => {
  let gta, gea, gia, commodities
  const owner = accounts[0]
  const player1 = accounts[1]
  const player2 = accounts[2]
  const nonPlayer = accounts[3]
  const qty = 5
  const price = 20

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
    const costOfSpaceship = await gta.costOfSpaceship()
    await gta.buySpaceship("A", { from: player1, value: costOfSpaceship })
    await gta.buySpaceship("B", { from: player2, value: costOfSpaceship })
    await gta.travelToPlanet(0, { from: player1 })
    await gta.travelToPlanet(0, { from: player2 })
  })

  it("should let player1 create a sell order (w/ commodity deposited for escrow)", async () => {
    // Mint commodity multiple times for player
    const amountRequired = await gia.getMiningCost(0)
    await gia.investInProduction(0, { from: player1, value: amountRequired })
    await mintCommodityXTimes(gia, 0, 4, player1)

    const currentCargoBefore = await gea.getCurrentCargo(player1)
    const response = await gea.createSellOrder(0, 0, qty, price, { from: player1 })
    const currentCargoAfter = await gea.getCurrentCargo(player1)

    assert.equal(
      currentCargoBefore.toString(),
      currentCargoAfter.add(qty).toString(),
      "cargo levels were not adjusted"
    )

    const { orderId } = response.logs[0].args
    const order = await gea.getSellOrder(0, 0, orderId)
    assert.equal(order[1], qty, 'did not create sell order')
    const balanceGEA = await commodities[0].balanceOf(gea.address)
    assert.equal(balanceGEA, qty, 'did not put commodity in escrow')
  })

  it("does not let a non-player make a sell-order", async () => {
    try {
      await gea.createSellOrder(0, 0, qty, price, { from: nonPlayer })
    } catch (e) {
      return assert(true)
    }
    assert(false, 'could create sell-order')
  })

  it("should let player2 buy player1's sell order", async () => {
    // Mint commodity multiple times for player
    const amountRequired = await gia.getMiningCost(0)
    await gia.investInProduction(0, { from: player1, value: amountRequired })
    await mintCommodityXTimes(gia, 0, 4, player1)

    const response = await gea.createSellOrder(0, 0, qty, price, { from: player1 })

    const player1EthBefore = await web3.eth.getBalance(player1)
    const { orderId } = response.logs[0].args

    await gea.buySellOrder(0, 0, orderId, { from: player2, value: qty * price })

    const currentCargoAfter = await gea.getCurrentCargo(player2)
    assert.equal(currentCargoAfter.toString(), qty.toString(), "player2 did not have cargo adjusted")

    const balancePlayer2 = await commodities[0].balanceOf(player2)
    const player1EthAfter = await web3.eth.getBalance(player1)
    assert.equal(balancePlayer2, qty, 'player2 did not receive purchased amount of commodity')

    const tradeCost = web3.toBigNumber(qty * price)
    assert.equal(player1EthAfter.toString(), player1EthBefore.add(tradeCost).toString(), 'player1 did not receive payment')

    const order = await gea.getSellOrder(0, 0, orderId)
    assert(!order[3], "did not set open bool to false")

    assert.equal(order[4], player2, "did not record player2 as buyer")
  })

  it("should not let non-player buy player1's sell order", async () => {
    // Mint commodity multiple times for player
    const amountRequired = await gia.getMiningCost(0)
    await gia.investInProduction(0, { from: player1, value: amountRequired })
    await mintCommodityXTimes(gia, 0, 4, player1)

    await gea.createSellOrder(0, 0, qty, price, { from: player1 })
    try {
      await gea.buySellOrder(0, orderId, { from: nonPlayer, value: qty * price })
    } catch (e) {
      return assert(true)
    }
    assert(false, "could buy sell-order")
  })

  it("should fail if player cannot fit the cargo they want to buy", async () => {
    // Fill up player2's cargo
    await fillUpCargoByMinting(gta, gia, player2, 0)
    // Find a amount of cargo that will max out player2's cargo
    const currentCargo = await gea.getCurrentCargo(player2)
    const availableCargo = await gta.getAvailableCargo(player2, currentCargo)
    const commodity = await gea.getCommodity(0)

    // Create a sell order with player1 that is too much cargo for player2
    const amountRequired = await gia.getMiningCost(0)
    await gia.investInProduction(0, { from: player1, value: amountRequired })
    const amountMinedPerBlock = commodity[4]
    const timesToMint = availableCargo.div(amountMinedPerBlock)
    try {
      await mintCommodityXTimes(gia, 0, timesToMint.add(1), player1)
    } catch (e) {}
    const response = await gea.createSellOrder(0, 0, availableCargo.add(1), price, { from: player1 })

    const { orderId } = response.logs[0].args

    try {
      await gea.buySellOrder(0, orderId, { from: player2, value: qty * price })
    } catch (e) {
      return assert(true)
    }

    assert(false, "did not revert")
  })
})
