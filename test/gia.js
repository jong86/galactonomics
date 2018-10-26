const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const deployCommodities = require('../util/deployCommodities')
const Commodity = artifacts.require("./Commodity.sol")

contract("GalacticIndustrialAuthority", accounts => {
  let gia, commodities
  const owner = accounts[0]
  const alice = accounts[1]
  const bob = accounts[2]
  const eve = accounts[3]

  beforeEach(async() => {
    commodities = await deployCommodities()
    const commodityAddresses = commodities.map(commodity => commodity.address)
    gia = await GalacticIndustrialAuthority.new(commodityAddresses)
    await commodities[0].setGIA(gia.address)
  })

  it("should store all the commodities", async () => {
    for (let i = 0; i < commodities.length; i++) {
      const commodity = await gia.getCommodity(i)
      assert.equal(commodity[0], await commodities[i].name(), 'not stored')
    }
  })

  it("should emit an event when player invests in production of a commodity", async () => {
    const response = await gia.investInProduction(0, { from: bob, value: web3.toWei(1, 'ether') })
    const { event, args } = response.logs[0]
    assert.equal(event, 'InvestmentMade', 'wrong event name')
    assert.equal(args.from, bob, 'wrong address logged')
    assert.equal(args.commodityId, 0, 'wrong commodityId logged')
    assert.equal(args.value, web3.toWei(1, 'ether'), 'wrong value logged')
  })

  it("should allow owner to mint commodities for another account", async () => {
    await gia.mintCommodityFor(0, bob)
    const balanceBob = await commodities[0].balanceOf(bob)
    const amtMinedPerBlock = (await gia.getCommodity(0))[4]
    assert.equal(amtMinedPerBlock.toString(), balanceBob.toString(), 'could not mint')
  })

  it("should not allow a non-owner to mint commodities for another account", async () => {
    try {
      await gia.mintCommodityFor(0, bob, { from: eve })
    } catch (e) {
      return assert(true)
    }

    assert(false, 'could mint')
  })
})
