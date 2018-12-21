/*
  This script gets state to point where account[1] has enough commodities
  to forge a crystal
*/

const CommodityReg = artifacts.require('./CommodityReg.sol')
const TransitAuthority = artifacts.require("./TransitAuthority.sol")
const CommodityEcon = artifacts.require("./CommodityEcon.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const CrystalReg = artifacts.require('./CrystalReg.sol')

const { mineCommodityXTimes, getCommoditiesTraded, getRandomPlanetToSell } = require('../test/util/testUtils')

module.exports = async function(done) {
  const accounts = await web3.eth.accounts
  const bob = accounts[1]
  let transitAuthority, commodityEcon, gia, crystalReg, tradedOnPlanet

  try {
    commodities = await CommodityReg.deployed()
    transitAuthority = await TransitAuthority.deployed()
    commodityEcon = await CommodityEcon.deployed()
    gia = await GalacticIndustrialAuthority.deployed()
    crystalReg = await CrystalReg.deployed()
    const costOfSpaceship = await transitAuthority.costOfSpaceship()
    await transitAuthority.buySpaceship('a', { from: bob, value: costOfSpaceship })
    tradedOnPlanet = await getCommoditiesTraded(commodityEcon)
  } catch (e) {
    console.error(e)
  }

  try {
    console.log("Bob is getting all the commodities...")
    for (let p = 0; p <= 6; p++) {
      console.log("Getting commodity", p + "...")
      console.log(">> travelling...")
      await transitAuthority.travelToPlanet(p, { from: bob })
      console.log(">> refueling...")
      const refuelCost = await transitAuthority.refuelCost()
      await transitAuthority.refuel({ from: bob, value: refuelCost })

      const forgingAmount = await crystalReg.forgingAmount()
      let commodityBalance = await commodities.getBalance(p, { from: bob })

      // Mint commodity until user has enough to forge
      while (commodityBalance.lt(forgingAmount)) {
        console.log(">> mining...")
        await mineCommodityXTimes(gia, 1, bob, p)
        commodityBalance = await commodities.getBalance(p, { from: bob })
      }

      // Unload unneeded overflow in a sell order, each iteration, to conserve cargo capacity
      if (commodityBalance.gt(forgingAmount)) {
        const planetToSell = getRandomPlanetToSell(p, tradedOnPlanet)
        await transitAuthority.travelToPlanet(planetToSell, { from: bob })
        console.log(`>> unloading excess... (selling commodity ${p} on planet ${planetToSell})`)
        const randomPrice = Math.round(Math.random() * 10000000)
        await commodityEcon.createSellOrder(planetToSell, p, commodityBalance.sub(forgingAmount), randomPrice, { from: bob })
      }
    }
  } catch (e) {
    console.error(e)
  }

  await transitAuthority.travelToPlanet(255, { from: bob })

  console.log("Minted all 7 commodities and now on planet 255")

  done()
}