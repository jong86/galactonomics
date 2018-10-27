const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const deployCommodities = require('../util/deployCommodities')

contract("GalacticEconomicAuthority", accounts => {
  let gta, gea, gia, commodities
  const owner = accounts[0]
  const player1 = accounts[1]
  const player2 = accounts[2]
  const nonPlayer = accounts[3]
  const qty = 1000
  const price = 350

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
    await gia.mintCommodityFor(0, player1)
    await gta.buySpaceship("A", { from: player1 })
    await gta.buySpaceship("B", { from: player2 })
  })

  it("let's owner set GEA address [*** move this to Commodity tests]", async () => {
    await commodities[3].setGEA(gea.address)
    const address = await commodities[3].gea()
    assert.equal(address, gea.address, 'did not set')
  })

  it("should let player1 create a sell order (w/ commodity deposited for escrow)", async () => {
    // Adding these in addition to previous mint in beforeEach
    await gia.mintCommodityFor(0, player1)
    await gia.mintCommodityFor(0, player1)
    await gia.mintCommodityFor(0, player1)
    await gia.mintCommodityFor(0, player1)

    const currentCargoBefore = (await gta.checkCargo(player1))[0]
    const response = await gea.createSellOrder(0, 0, qty, price, { from: player1 })
    const currentCargoAfter = (await gta.checkCargo(player1))[0]

    const cargoTotalMass = (await gea.getCommodity(0))[5].mul(qty)
    assert.equal(
      currentCargoBefore.toString(),
      currentCargoAfter.add(cargoTotalMass).toString(),
      "cargo levels were not adjusted"
    )

    const { orderId } = response.logs[0].args
    const order = await gea.getSellOrder(0, orderId)
    assert.equal(order[2], qty, 'did not create sell order')
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
    // Adding these in addition to previous mint in beforeEach
    await gia.mintCommodityFor(0, player1)
    await gia.mintCommodityFor(0, player1)
    await gia.mintCommodityFor(0, player1)
    await gia.mintCommodityFor(0, player1)

    const response = await gea.createSellOrder(0, 0, qty, price, { from: player1 })

    const player1EthBefore = await web3.eth.getBalance(player1)
    const { orderId } = response.logs[0].args

    await gea.buySellOrder(0, orderId, { from: player2, value: qty * price })
    const currentCargoAfter = (await gta.checkCargo(player2))[0]
    const cargoTotalMass = (await gea.getCommodity(0))[5].mul(qty)
    assert.equal(currentCargoAfter.toString(), cargoTotalMass.toString(), "player2 did not have cargo adjusted")
    
    const balancePlayer2 = await commodities[0].balanceOf(player2)
    const player1EthAfter = await web3.eth.getBalance(player1)
    assert.equal(balancePlayer2, qty, 'player2 did not receive purchased amount of commodity')
    
    const tradeCost = web3.toBigNumber(qty * price)
    assert.equal(player1EthAfter.toString(), player1EthBefore.add(tradeCost).toString(), 'player1 did not receive payment')
  })

  it("should not let non-player buy player1's sell order", async () => {
    await gea.createSellOrder(0, 0, qty, price, { from: player1 })
    try {
      await gea.buySellOrder(0, orderId, { from: nonPlayer, value: qty * price })
    } catch (e) {
      return assert(true)
    }
    assert(false, "could buy sell-order")
  })
})
