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
  const qty = 1000
  const price = 350

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
    const investment = await gia.getRequiredInvestment(0)
    const response = await gia.investInProduction(0, { from: player1, value: investment })

    const i = response.logs.findIndex(item => item.event === "InvestmentMade")
    if (i === -1) assert(false, 'event not emitted')
    const { args } = response.logs[i]
    assert.equal(args.from, player1, 'wrong address logged')
    assert.equal(args.commodityId, 0, 'wrong commodityId logged')
    assert.equal(args.value.toString(), investment.toString(), 'wrong value logged')
  })

  it("does not let a non-player invest in production of a commodity", async () => {
    try {
      await gia.investInProduction(0, { from: nonPlayer, value: web3.toWei(1, 'ether') })
    } catch (e) {
      return assert(true)
    }
    assert(false, 'allowed a non-player to invest in production')
  })

  it("should allow owner to mint commodities for another account", async () => {
    const currentCargoBefore = await gea.getCurrentCargo(player1)
    await gia.mintCommodityFor(0, player1)
    const currentCargoAfter = await gea.getCurrentCargo(player1)

    const commodityInfo = await gea.getCommodity(0)
    const cargoTotalMass = (commodityInfo[4]).mul(commodityInfo[5])
    assert.equal(
      currentCargoBefore.add(cargoTotalMass).toString(),
      currentCargoAfter.toString(),
      "did not adjust cargo amount on spaceship"
    )

    const balancePlayer1 = await commodities[0].balanceOf(player1)
    const amtMinedPerBlock = (await gia.getCommodity(0))[4]
    assert.equal(amtMinedPerBlock.toString(), balancePlayer1.toString(), 'did not mint')
  })

  it("should not allow a non-owner to mint commodities for another account", async () => {
    try {
      await gia.mintCommodityFor(0, player1, { from: eve })
    } catch (e) {
      return assert(true)
    }
    
    assert(false, 'could mint')
  })

  it("should fail when user wants to make an investment but doesn't have availability for the cargo", async () => {
    // Max out cargo
    Array(50).fill(gia.mintCommodityFor).forEach(async promise => await promise(0, player1))

    try {
      await gia.mintCommodityFor(0, player1)
    } catch (e) {
      return assert(true)
    }

    assert(false, 'did not fail')
  })
})
