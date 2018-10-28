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
    const costOfSpaceship = await gta.costOfSpaceship()
    await gta.buySpaceship("A", { from: player1, value: costOfSpaceship })
    await gta.buySpaceship("B", { from: player2, value: costOfSpaceship })
  })

  // it("should store all the commodities", async () => {
  //   for (let i = 0; i < commodities.length; i++) {
  //     const commodity = await gia.getCommodity(i)
  //     assert.equal(commodity[0], await commodities[i].name(), 'not stored')
  //   }
  // })

  // it("should emit an event when player invests in production of a commodity", async () => {
  //   const amountRequired = await gia.getAmountRequired(0)
  //   const response = await gia.investInProduction(0, { from: player1, value: amountRequired })

  //   const i = response.logs.findIndex(item => item.event === "InvestmentMade")
  //   if (i === -1) assert(false, 'event not emitted')
  //   const { args } = response.logs[i]
  //   assert.equal(args.from, player1, 'wrong address logged')
  //   assert.equal(args.commodityId, 0, 'wrong commodityId logged')
  //   assert.equal(args.value.toString(), amountRequired.toString(), 'wrong value logged')
  // })

  // it("does not let a non-player invest in production of a commodity", async () => {
  //   const amountRequired = await gia.getAmountRequired(0)
  //   try {
  //     await gia.investInProduction(0, { from: nonPlayer, value: amountRequired })
  //   } catch (e) {
  //     return assert(true)
  //   }
  //   assert(false, 'allowed a non-player to invest in production')
  // })

  // it("should allow owner to mint commodities for another account", async () => {
  //   const amountRequired = await gia.getAmountRequired(0)
  //   await gia.investInProduction(0, { from: player1, value: amountRequired })
  //   const currentCargoBefore = await gea.getCurrentCargo(player1)
  //   await gia.mintCommodityFor(0, player1)
  //   const currentCargoAfter = await gea.getCurrentCargo(player1)

  //   const commodityInfo = await gea.getCommodity(0)
  //   const cargoTotalMass = (commodityInfo[4]).mul(commodityInfo[5])
  //   assert.equal(
  //     currentCargoBefore.add(cargoTotalMass).toString(),
  //     currentCargoAfter.toString(),
  //     "did not adjust cargo amount on spaceship"
  //   )

  //   const balancePlayer1 = await commodities[0].balanceOf(player1)
  //   const amtMinedPerBlock = (await gia.getCommodity(0))[4]
  //   assert.equal(amtMinedPerBlock.toString(), balancePlayer1.toString(), 'did not mint')
  // })

  // it("should not allow a non-owner to mint commodities for another account", async () => {
  //   try {
  //     await gia.mintCommodityFor(0, player1, { from: eve })
  //   } catch (e) {
  //     return assert(true)
  //   }

  //   assert(false, 'could mint')
  // })

  // it("should fail when user wants to make an investment but doesn't have availability for the cargo", async () => {
  //   const amountRequired = await gia.getAmountRequired(0)
  //   const blocksToProduceFor = await gia.blocksToProduceFor()
  //   const maxCargo = (await gta.addressToSpaceship(player1))[2]

  //   // Max out cargo
  //   while ((await gea.getCurrentCargo(player1) < maxCargo)) {
  //     await gia.investInProduction(0, { from: player1, value: amountRequired })
  //     Array(blocksToProduceFor).fill(gia.mintCommodityFor).forEach(async promise => await promise(0, player1))
  //   }

  //   try {
  //     await gia.investInProduction(0, { from: player1, value: amountRequired })
  //   } catch (e) {
  //     return assert(true)
  //   }

  //   assert(false, 'did not fail')
  // })

  // it("records investment in mapping when player invests in production of a commodity", async () => {
  //   const amountRequired = await gia.getAmountRequired(0)
  //   await gia.investInProduction(0, { from: player1, value: amountRequired })
  //   const response = await gia.getInvestment(player1)
  //   assert.equal(response[0].toString(), amountRequired.toString(), "did not record")
  // })

  // it("prevents player from mining more than one commodity at a time", async () => {
  //   const amountRequired = await gia.getAmountRequired(0)
  //   await gia.investInProduction(0, { from: player1, value: amountRequired })
  //   try {
  //     await gia.investInProduction(0, { from: player1, value: amountRequired })
  //   } catch (e) {
  //     return assert(true)
  //   }
  //   assert(false, "did not prevent")
  // })

  // it("prevents owner account from minting more if there are no blocksLeft", async () => {
  //   const amountRequired = await gia.getAmountRequired(0)
  //   await gia.investInProduction(0, { from: player1, value: amountRequired })
  //   let blocksLeft = (await gia.getInvestment(player1))[1]

  //   while (blocksLeft > 0) {
  //     await gia.mintCommodityFor(0, player1)
  //     blocksLeft = (await gia.getInvestment(player1))[1]
  //   }

  //   try {
  //     await gia.mintCommodityFor(0, player1)
  //   } catch (e) {
  //     return assert(true)
  //   }
  //   assert(false, 'did not fail')
  // })

  it("if player does not have enough cargo space for minted commodity, player does not receive overflow", async () => {
    const amountRequired = await gia.getAmountRequired(0)
    const blocksToProduceFor = await gia.blocksToProduceFor()
    const maxCargo = (await gta.addressToSpaceship(player1))[2]

    // Max out cargo
    while ((await gea.getCurrentCargo(player1) < maxCargo)) {
      await gia.investInProduction(0, { from: player1, value: amountRequired })
      Array(blocksToProduceFor).fill(gia.mintCommodityFor).forEach(async promise => await promise(0, player1))
    }

    const cargoBefore = await gia.getCurrentCargo(player1)
    const balanceBefore = await commodities[0].balanceOf(player1)
    await gia.mintCommodityFor(0, player1)
    const cargoAfter = await gia.getCurrentCargo(player1)
    const balanceAfter = await commodities[0].balanceOf(player1)

    assert.equal(cargoBefore, cargoAfter, "cargo changed")
    assert.equal(balanceBefore, balanceAfter, "balance changed")
  })
})
