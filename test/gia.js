const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const deployCommodities = require('../utils/deployCommodities')
const { fillUpCargoByMinting, mintCommodityXTimes } = require('./util/testUtils')
const sha256 = require('js-sha256');


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
    await gta.travelToPlanet(0, { from: player1 })
    await gta.travelToPlanet(0, { from: player2 })
  })

  // it("should store all the commodities", async () => {
  //   for (let i = 0; i < commodities.length; i++) {
  //     const commodity = await gia.getCommodity(i)
  //     assert.equal(commodity[0], await commodities[i].name(), 'not stored')
  //   }
  // })

  // it("should emit an event when player invests in production of a commodity", async () => {
  //   const amountRequired = await gia.getMiningCost(0)
  //   const response = await gia.investInProduction(0, { from: player1, value: amountRequired })

  //   const i = response.logs.findIndex(item => item.event === "InvestmentMade")
  //   if (i === -1) assert(false, 'event not emitted')
  //   const { args } = response.logs[i]
  //   assert.equal(args.addr, player1, 'wrong address logged')
  //   assert.equal(args.blocksLeft.toString(), (await gia.getInvestment(args.addr))[1].toString(), 'wrong blocksLeft logged')
  // })

  // it("does not let a non-player invest in production of a commodity", async () => {
  //   const amountRequired = await gia.getMiningCost(0)
  //   try {
  //     await gia.investInProduction(0, { from: nonPlayer, value: amountRequired })
  //   } catch (e) {
  //     return assert(true)
  //   }
  //   assert(false, 'allowed a non-player to invest in production')
  // })

  // it("should allow owner to mint commodities for another account", async () => {
  //   const amountRequired = await gia.getMiningCost(0)
  //   await gia.investInProduction(0, { from: player1, value: amountRequired })
  //   const currentCargoBefore = await gea.getCurrentCargo(player1)
  //   await gia.mintCommodityFor(player1)
  //   const currentCargoAfter = await gea.getCurrentCargo(player1)

  //   const commodityInfo = await gea.getCommodity(0)
  //   const cargoTotalMass = commodityInfo[4]
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
  //     await gia.mintCommodityFor(player1, { from: eve })
  //   } catch (e) {
  //     return assert(true)
  //   }

  //   assert(false, 'could mint')
  // })

  // it("should fail when user wants to make an investment but doesn't have availability for the cargo", async () => {
  //   await fillUpCargoByMinting(gta, gia, player1, 0)

  //   try {
  //     await gia.investInProduction(0, { from: player1, value: amountRequired })
  //   } catch (e) {
  //     return assert(true)
  //   }

  //   assert(false, 'did not fail')
  // })

  // it("records investment in mapping when player invests in production of a commodity", async () => {
  //   const amountRequired = await gia.getMiningCost(0)
  //   await gia.investInProduction(0, { from: player1, value: amountRequired })
  //   const response = await gia.getInvestment(player1)
  //   assert.equal(response[0].toString(), "0", "did not record")
  // })

  // it("prevents player from mining more than one commodity at a time", async () => {
  //   const amountRequired = await gia.getMiningCost(0)
  //   await gia.investInProduction(0, { from: player1, value: amountRequired })
  //   try {
  //     await gia.investInProduction(0, { from: player1, value: amountRequired })
  //   } catch (e) {
  //     return assert(true)
  //   }
  //   assert(false, "did not prevent")
  // })

  // it("prevents owner account from minting more if there are no blocksLeft", async () => {
  //   const amountRequired = await gia.getMiningCost(0)
  //   await gia.investInProduction(0, { from: player1, value: amountRequired })
  //   let blocksLeft = (await gia.getInvestment(player1))[1]

  //   while (blocksLeft > 0) {
  //     await gia.mintCommodityFor(player1)
  //     blocksLeft = (await gia.getInvestment(player1))[1]
  //   }

  //   try {
  //     await gia.mintCommodityFor(player1)
  //   } catch (e) {
  //     return assert(true)
  //   }
  //   assert(false, 'did not fail')
  // })

  // it("if player does not have enough cargo space for minted commodity, player does not receive overflow", async () => {
  //   assert(false, "this test not implemented")
  // })

  it("mints commodity for player when player submits valid proof-of-work", async () => {
    const response = await gia.submitProofOfWork('1239udasSDx', 0, { from: player1 })
    console.log('response.logs[0].args', response.logs[0].args);
    let nonce = 0
    let hash = sha256(String(nonce))
    while (hash.substr(0, 5) !== '00000') {
      hash = sha256(String(nonce))
      nonce++
      console.log('***', hash)
    }
  })
})
