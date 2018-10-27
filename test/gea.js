const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const deployCommodities = require('../util/deployCommodities')

contract("GalacticEconomicAuthority", accounts => {
  let gta, gea, gia, commodities
  const owner = accounts[0]
  const alice = accounts[1]
  const bob = accounts[2]
  const eve = accounts[3]

  beforeEach(async() => {
    commodities = await deployCommodities()
    const commodityAddresses = commodities.map(commodity => commodity.address)
    gta = await GalacticTransitAuthority.new()
    gea = await GalacticEconomicAuthority.new(commodityAddresses, gta.address)
    gia = await GalacticIndustrialAuthority.new(commodityAddresses)
    commodities.forEach(async commodity => await commodity.setGEA(gea.address))
    commodities.forEach(async commodity => await commodity.setGIA(gia.address))
    // mint some commodities for alice, so can test
    await gia.mintCommodityFor(0, alice)
  })

  it("let's owner set GEA address", async () => {
    await commodities[3].setGEA(bob)
    const address = await commodities[3].gea()
    assert.equal(address, bob, 'did not set')
  })

  it("should let a player create a sell order (w/ commodity deposited for escrow)", async () => {
    const qty = 1000
    const price = 350
    const response = await gea.createSellOrder(0, 0, qty, price, { from: alice })
    const { orderId } = response.logs[0].args
    const order = await gea.getSellOrder(0, orderId)
    assert.equal(order[2], qty, 'did not create sell order')
    const balanceGEA = await commodities[0].balanceOf(gea.address)
    assert.equal(balanceGEA, qty, 'did not put commodity in escrow')
  })

  it("should let a player buy another player's sell order", async () => {
    const qty = 1000
    const price = 350
    const response = await gea.createSellOrder(0, 0, qty, price, { from: alice })
    const aliceEthBefore = await web3.eth.getBalance(alice)
    const { orderId } = response.logs[0].args
    await gea.buySellOrder(0, orderId, { from: bob, value: qty * price })
    const balanceBob = await commodities[0].balanceOf(bob)
    const aliceEthAfter = await web3.eth.getBalance(alice)
    assert.equal(balanceBob, qty, 'player did not receive purchased amount of commodity')
    const tradeCost = web3.toBigNumber(qty * price)
    assert.equal(aliceEthAfter.toString(), aliceEthBefore.add(tradeCost).toString(), 'alice did not receive payment')
  })
})
