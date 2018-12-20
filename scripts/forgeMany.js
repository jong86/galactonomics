/*
  This script gets state to point where account[1] owns many crystals
*/

const CommodityAuthority = artifacts.require('./CommodityAuthority.sol')
const TransitAuthority = artifacts.require("./TransitAuthority.sol")
const EconomicAuthority = artifacts.require("./EconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const CrystalAuthority = artifacts.require('./CrystalAuthority.sol')

const { mineCommodityXTimes, getCommoditiesTraded, getRandomPlanetToSell } = require('../test/util/testUtils')


module.exports = async function(done) {
  const accounts = await web3.eth.accounts
  const bob = accounts[1]
  let transitAuthority, economicAuthority, gia, crystalAuthority, tradedOnPlanet

  try {
    commodities = await CommodityAuthority.deployed()
    transitAuthority = await TransitAuthority.deployed()
    economicAuthority = await EconomicAuthority.deployed()
    gia = await GalacticIndustrialAuthority.deployed()
    crystalAuthority = await CrystalAuthority.deployed()
    // const costOfSpaceship = await transitAuthority.costOfSpaceship()
    // await transitAuthority.buySpaceship('a', { from: bob, value: costOfSpaceship })
    tradedOnPlanet = await getCommoditiesTraded(economicAuthority)
  } catch (e) {
    console.error(e)
  }

  try {
    // r stands for round of trips (to get a crystal)
    for (let r = 0; r < 8; r++) {
      console.log(`${bob} is getting all the commodities (round ${r})`)
      // p stands for planet
      for (let p = 0; p < 7; p++) {
        console.log("Getting commodity", p + "...")
        console.log(">> travelling...")
        await transitAuthority.travelToPlanet(p, { from: bob })
        console.log(">> refueling...")
        const refuelCost = await transitAuthority.refuelCost()
        await transitAuthority.refuel({ from: bob, value: refuelCost })

        const forgingAmount = await crystalAuthority.forgingAmount()
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
          await economicAuthority.createSellOrder(planetToSell, p, commodityBalance.sub(forgingAmount), randomPrice, { from: bob })
        }
      }

      console.log(">> travelling to crystalAuthority...")
      await transitAuthority.travelToPlanet(255, { from: bob })
      console.log(">> forging a crystal...")
      await crystalAuthority.forge({ from: bob })
    }
  } catch (e) {
    console.error(e)
    return done()
  }

  console.log(`${bob} forged a bunch of crystals and is now on planet 255`)

  done()
}