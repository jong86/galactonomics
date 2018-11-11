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

  before(async() => {
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

  it("Player can't forge crystal if doesn't have enough commodities", async () => {
    await gta.travelToPlanet(255, { from: player1 })
    await temple.forge({ from: player1 })
    let balance
    try {
      balance = await temple.balanceOf(player1)
    } catch (e) {}
    assert.equal(balance.toString(), '0', 'player could forge')
  })

  before(async () => {
    // Give players enough of each commodity to be able to forge a crystal
    console.log('Minting commodities for 2 players, this may take a while...')
    await Promise.all([player1, player2].map(player => new Promise(async (resolve, reject) => {
      try {
        // Move player to each planet so can mine each commodity
        for (let i = 0; i <= 6; i++) {
          await gta.travelToPlanet(i, { from: player })
          const refuelCost = await gta.refuelCost()
          await gta.refuel({ from: player, value: refuelCost })

          const forgingAmount = await temple.forgingAmount()
          let commodityBalance = await gea.getCommodityBalance(i, { from: player })

          // Mint commodity until user has enough to forge
          while (commodityBalance.lt(forgingAmount)) {
            const commodity = await gea.getCommodity(i)
            const miningCost = commodity[3]
            const miningDuration = commodity[5]
            await gia.investInProduction(i, { from: player, value: miningCost })
            await mintCommodityXTimes(gia, miningDuration.toNumber(), player)
            commodityBalance = await gea.getCommodityBalance(i, { from: player })
          }

          // Unload unneeded overflow in a sell order, each iteration, to conserve cargo capacity
          if (commodityBalance.gt(forgingAmount)) {
            await gea.createSellOrder(i, i, commodityBalance.sub(forgingAmount), 100, { from: player })
          }
        }
        resolve()
      } catch (e) {
        reject(e)
      }
    })))
  })

  it("Player can forge a crystal", async () => {
    await gta.travelToPlanet(255, { from: player1 })
    await temple.forge({ from: player1 })
    const balance = await temple.balanceOf(player1)
    assert.equal(balance.toString(), '1', 'did not forge a b. crystal for player1')
  })

  it("Forged crystals get a unique URI", async () => {
    await gta.travelToPlanet(255, { from: player2 })
    await temple.forge({ from: player2 })

    let crystalIndexes, crystal

    crystalIndexes = await temple.getOwnedCrystalIndexes(player1)
    crystal = await temple.getCrystal(crystalIndexes[0])
    const uri1 = await temple.tokenURI(crystal.id)

    crystalIndexes = await temple.getOwnedCrystalIndexes(player2)
    crystal = await temple.getCrystal(crystalIndexes[0])
    const uri2 = await temple.tokenURI(crystal.id)

    assert(uri1, 'uri1 not defined')
    assert(uri2, 'uri2 not defined')
    assert(uri1 !== uri2, 'URIs were the same')
  })

  // it("Player's commodities get burned after forging", async () => {

  // })

  // it("Player can put a crystal up for sale", async () => {

  // })

  // it("Player can cancel sale of a crystal", async () => {

  // })

  // it("Player can buy a crystal that is for sale", async () => {

  // })
})
