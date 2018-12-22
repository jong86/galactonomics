const CommodityReg = artifacts.require("./CommodityReg.sol")
const CommodityEcon = artifacts.require("./CommodityEcon.sol")
const CommodityInd = artifacts.require("./CommodityInd.sol")
const { mineCommodityXTimes } = require('./util/testUtils')
const truffleAssert = require('truffle-assertions')

contract("CommodityEcon", accounts => {
  let commodityEcon, commodityReg, commodityInd
  const player1 = accounts[1]
  const player2 = accounts[2]
  const qty = 5
  const price = 20
  const commodityId = 129
  const gasPrice = web3.eth.gasPrice

  beforeEach(async() => {
    // Deploy contracts
    commodityReg = await CommodityReg.new()
    commodityEcon = await CommodityEcon.new(commodityReg.address)
    commodityInd = await CommodityInd.new(commodityReg.address)

    // Set access controls
    await commodityReg.setCommodityEcon(commodityEcon.address)
    await commodityReg.setCommodityInd(commodityInd.address)
  })

  it("should let player1 create a sell order (w/ commodity deposited for escrow)", async () => {
    await mineCommodityXTimes(commodityInd, 4, player1, commodityId)

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
    await mineCommodityXTimes(commodityInd, 4, player1, commodityId)

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
})
