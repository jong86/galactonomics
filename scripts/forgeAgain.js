/*
  This script gets state to point where account[1] has enough commodities
  to forge a crystal
*/

const Commodities = artifacts.require('./Commodities.sol')
const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const TempleAuthority = artifacts.require('./TempleAuthority.sol')

const { mineCommodityXTimes, getCommoditiesTraded, getRandomPlanetToSell } = require('../test/util/testUtils')

module.exports = async function(done) {
  const accounts = await web3.eth.accounts
  const bob = accounts[1]
  let gta, gea, gia, temple, tradedOnPlanet

  try {
    commodities = await Commodities.deployed()
    gta = await GalacticTransitAuthority.deployed()
    gea = await GalacticEconomicAuthority.deployed()
    gia = await GalacticIndustrialAuthority.deployed()
    temple = await TempleAuthority.deployed()
    tradedOnPlanet = await getCommoditiesTraded(gea)
  } catch (e) {
    console.error(e)
  }

  try {
    console.log("Bob is getting all the commodities...")
    for (let p = 0; p <= 6; p++) {
      console.log("Getting commodity", p + "...")
      console.log(">> travelling...")
      await gta.travelToPlanet(p, { from: bob })
      console.log(">> refueling...")
      const refuelCost = await gta.refuelCost()
      await gta.refuel({ from: bob, value: refuelCost })

      const forgingAmount = await temple.forgingAmount()
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
        await gta.travelToPlanet(planetToSell, { from: bob })
        console.log(`>> unloading excess... (selling commodity ${p} on planet ${planetToSell})`)
        const randomPrice = Math.round(Math.random() * 10000000)
        await gea.createSellOrder(planetToSell, p, commodityBalance.sub(forgingAmount), randomPrice, { from: bob })
      }
    }
  } catch (e) {
    console.error(e)
  }

  await gta.travelToPlanet(255, { from: bob })

  console.log("Minted all 7 commodities and now on planet 255")

  done()
}