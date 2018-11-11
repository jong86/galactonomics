const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const TempleAuthority = artifacts.require("./TempleAuthority.sol")
const { fillUpCargoByMinting, mintCommodityXTimes } = require('./util/testUtils')
const deployCommodities = require('../utils/deployCommodities')


contract("Commodity", accounts => {
  let gta, gea, gia, commodities, temple
  const owner = accounts[0]
  const player1 = accounts[3]
  const player2 = accounts[4]

  beforeEach(async() => {
    commodities = await deployCommodities()
    const commodityAddresses = commodities.map(commodity => commodity.address)
    gta = await GalacticTransitAuthority.new()
    gea = await GalacticEconomicAuthority.new(commodityAddresses, gta.address)
    gia = await GalacticIndustrialAuthority.new(commodityAddresses, gta.address)
    temple = await TempleAuthority.new(commodityAddresses, gta.address)
    commodities.forEach(async commodity => await commodity.setGEA(gea.address))
    commodities.forEach(async commodity => await commodity.setGIA(gia.address))
    const costOfSpaceship = await gta.costOfSpaceship()
    await gta.buySpaceship("A", { from: player1, value: costOfSpaceship })
    await gta.buySpaceship("B", { from: player2, value: costOfSpaceship })
    await gta.travelToPlanet(0, { from: player1 })
    await gta.travelToPlanet(0, { from: player2 })
  })

  it("GIA can forge a crystal for a player", async () => {

  })

  it("Forged crystals get a unique URI", async () => {

  })

  it("Player's commodities get burned after being sent to GIA for forging", async () => {

  })

  it("Player's commodities get burned after being sent to GIA for forging", async () => {

  })

  it("GEA can ownership of a crystal to a player", async () => {

  })
})
