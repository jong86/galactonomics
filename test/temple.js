const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const TempleAuthority = artifacts.require("./TempleAuthority.sol")
const { fillUpCargoByMinting, mintCommodityXTimes } = require('./util/testUtils')
const deployCommodities = require('../utils/deployCommodities')


contract("Commodity", accounts => {
  let gta, gea, gia, commodities, temple
  const owner = accounts[0]
  const player1 = accounts[1]
  const player2 = accounts[2]

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

  // it("Player can forge a crystal", async () => {

  // })

  // it("Player can't forge crystal if doesn't have enough commodities", async () => {

  // })

  // it("Forged crystals get a unique URI", async () => {

  // })

  // it("Player's commodities get burned after forging", async () => {

  // })

  // it("Player can put a crystal up for sale", async () => {

  // })

  // it("Player can cancel sale of a crystal", async () => {

  // })

  // it("Player can buy a crystal that is for sale", async () => {

  // })
})
