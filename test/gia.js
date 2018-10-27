const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const deployCommodities = require('../util/deployCommodities')

contract("GalacticIndustrialAuthority", accounts => {
  let gta, gea, gia, commodities
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
    commodities.forEach(async commodity => await commodity.setGEA(gea.address))
    commodities.forEach(async commodity => await commodity.setGIA(gia.address))
    await gta.buySpaceship("A", { from: player1 })
    await gta.buySpaceship("B", { from: player2 })
  })

  it("should store all the commodities", async () => {
    for (let i = 0; i < commodities.length; i++) {
      const commodity = await gia.getCommodity(i)
      assert.equal(commodity[0], await commodities[i].name(), 'not stored')
    }
  })

  it("should emit an event when player invests in production of a commodity", async () => {
    const response = await gia.investInProduction(0, { from: player1, value: web3.toWei(1, 'ether') })
    const { event, args } = response.logs[0]
    assert.equal(event, 'InvestmentMade', 'wrong event name')
    assert.equal(args.from, player1, 'wrong address logged')
    assert.equal(args.commodityId, 0, 'wrong commodityId logged')
    assert.equal(args.value, web3.toWei(1, 'ether'), 'wrong value logged')
  })

  it("does not let a non-player invests in production of a commodity", async () => {
    try {
      await gia.investInProduction(0, { from: nonPlayer, value: web3.toWei(1, 'ether') })
    } catch (e) {
      return assert(true)
    }
    assert(false, 'allowed a non-player to invest in production')
  })

  it("should allow owner to mint commodities for another account", async () => {
    await gia.mintCommodityFor(0, player1)
    const balancePlayer1 = await commodities[0].balanceOf(player1)
    const amtMinedPerBlock = (await gia.getCommodity(0))[4]
    assert.equal(amtMinedPerBlock.toString(), balancePlayer1.toString(), 'could not mint')
  })

  it("should not allow a non-owner to mint commodities for another account", async () => {
    try {
      await gia.mintCommodityFor(0, player1, { from: eve })
    } catch (e) {
      return assert(true)
    }
    assert(false, 'could mint')
  })
})
