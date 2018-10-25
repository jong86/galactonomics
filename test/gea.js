const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const deployCommodities = require('../util/deployCommodities')

contract("GalacticEconomicAuthority", accounts => {
  let gea
  const owner = accounts[0]
  const alice = accounts[1]
  const bob = accounts[2]
  const eve = accounts[3]

  beforeEach(async() => {
    commodities = await deployCommodities()
    gea = await GalacticEconomicAuthority.new()
  })

  it("should let a player create a sell order", async () => {
    const response = await gea.createSellOrder(0, 0, 1000, 350, { from: alice })
    const { orderId } = response.logs[0].args
    const order = await gea.getSellOrder(0, orderId)
    console.log('order', order);
    assert.equal(order[0], 1000, 'did not create order')
  })

  it("should let a player buy another player's sell order", async () => {
    const response = await gea.createSellOrder(0, 0, 1000, 350, { from: alice })
    await gea.buySellOrder(0, 0, { from: bob })
    const balanceBob = await commodities[0].balanceOf(bob)
    assert.equal(balanceBob, 1000, 'player did not receive purchased amount of commodity')
  })
})
