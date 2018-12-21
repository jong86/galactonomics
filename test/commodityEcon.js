const CommodityReg = artifacts.require("./CommodityReg.sol")
const CommodityEcon = artifacts.require("./CommodityEcon.sol")
const { fillUpCargoByMining, mineCommodityXTimes, getRandomPlanetToSell } = require('./util/testUtils')
const truffleAssert = require('truffle-assertions');


contract("CommodityEcon", accounts => {
  let transitAuthority, commodityEcon, gia, commodities, allCommodities, tradedOnPlanet
  const player1 = accounts[1]
  const player2 = accounts[2]
  const qty = 5
  const price = 20
  const commodityId = 129
  const gasPrice = web3.eth.gasPrice

  beforeEach(async() => {
    commodityReg = await CommodityReg.new()
    commodityEcon = await CommodityEcon.new(commodityReg.address)
  })

  it("should let player1 create a sell order (w/ commodity deposited for escrow)", async () => {
    await mineCommodityXTimes(commodityReg, 4, player1, commodityId)

    const response = await commodityEcon.createSellOrder(commodityId, qty, price, { from: player1 })

    const { orderId } = response.logs[0].args
    const order = await commodityEcon.getSellOrder(commodityId, orderId)
    assert.equal(order[1], qty, 'did not create sell order')

    const balanceEscrow = await commodityReg.balanceOf(commodityReg.address, commodityId)
    assert.equal(balanceEscrow.toString(), qty.toString(), 'did not put commodity in escrow')
  })

  it("does not let a player make a sell-order if they don't own enough of the commodty", async () => {
    await truffleAssert.reverts(
      commodityEcon.createSellOrder(commodityId, qty, price, { from: player1 }),
      "You do not own enough of this commodity"
    );

    const balanceEscrow = await commodityReg.balanceOf(commodityReg.address, commodityId)
    assert.equal(balanceEscrow.toString(), "0", "may have put commodity in escrow")
  })

  it("should let player2 buy player1's sell order", async () => {
    // Give player1 something to sell
    await mineCommodityXTimes(commodityReg, 4, player1, commodityId)

    // Create sell order on that planet
    let response = await commodityEcon.createSellOrder(commodityId, qty, price, { from: player1 })
    const { orderId } = response.logs[0].args

    // Store players' eth balances to test eth transfer
    const player1EthBefore = await web3.eth.getBalance(player1)
    const player2EthBefore = await web3.eth.getBalance(player2)

    // Player2 buys the sell order
    response = await commodityEcon.buySellOrder(commodityId, orderId, { from: player2, value: qty * price, gasPrice })

    // Store players' eth balances after player2's purchase
    const player1EthAfter = await web3.eth.getBalance(player1)
    const player2EthAfter = await web3.eth.getBalance(player2)

    // Assert player2 new commodity balance
    const balancePlayer2 = await commodityReg.balanceOf(player2, commodityId)
    assert.equal(balancePlayer2, qty, 'player2 did not receive purchased amount of commodity')

    // Assert players' before/after eth balances
    const tradeCost = web3.toBigNumber(qty * price)
    assert.deepEqual(player1EthAfter, player1EthBefore.add(tradeCost), 'player1 did not receive eth payment')
    const { gasUsed } = response.receipt
    const fee = gasPrice.mul(gasUsed)
    const totalDiff = fee.add(tradeCost)
    assert.deepEqual(player2EthAfter, player2EthBefore.sub(totalDiff), 'player2 did not send eth payment')

    // Assert that sell order is now closed
    const order = await commodityEcon.getSellOrder(commodityId, orderId)
    assert(!order[3], "did not set open bool to false")

    // Assert record of buyer address
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
