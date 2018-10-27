const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const deployCommodities = require('../util/deployCommodities')

contract("GalacticEconomicAuthority", accounts => {
  let gea, gia, commodities
  const owner = accounts[0]
  const alice = accounts[1]
  const bob = accounts[2]
  const eve = accounts[3]

  beforeEach(async() => {
    commodities = await deployCommodities()
    const commodityAddresses = commodities.map(commodity => commodity.address)
    gea = await GalacticEconomicAuthority.new(commodityAddresses)
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

  it("should let a player create a sell order (contract acts as escrow)", async () => {
    try {
      var response = await gea.createSellOrder(0, 0, 10, 350, { from: alice })
    } catch (e) {
      console.log('response', response);
    }
    const { orderId } = response.logs[0].args
    const order = await gea.getSellOrder(0, orderId)
    assert.equal(order[2], 10, 'did not create order')
    const balanceGEA = await commodities[0].balanceOf(gea.address)
    console.log('balanceGEA', balanceGEA);
  })

  it("should let a player buy another player's sell order", async () => {
    const response = await gea.createSellOrder(0, 0, 1000, 350, { from: alice })
    await gea.buySellOrder(0, 0, { from: bob })
    const balanceBob = await commodities[0].balanceOf(bob)
    assert.equal(balanceBob, 1000, 'player did not receive purchased amount of commodity')
  })
})
