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

  for (let i = 1; i < 9; i++) {
    const player = accounts[i]
    let transitAuthority, economicAuthority, gia, crystalAuthority, tradedOnPlanet

    try {
      commodities = await CommodityAuthority.deployed()
      transitAuthority = await TransitAuthority.deployed()
      economicAuthority = await EconomicAuthority.deployed()
      gia = await GalacticIndustrialAuthority.deployed()
      crystalAuthority = await CrystalAuthority.deployed()
      const costOfSpaceship = await transitAuthority.costOfSpaceship()
      await transitAuthority.buySpaceship('a', { from: player, value: costOfSpaceship })
      tradedOnPlanet = await getCommoditiesTraded(economicAuthority)
    } catch (e) {
      console.error(e)
    }

    try {
      // r stands for round of trips (to get a crystal)
      for (let r = 0; r < 8; r++) {
        console.log(`${player} is getting all the commodities (round ${r})`)
        // p stands for planet
        for (let p = 0; p < 7; p++) {
          console.log("Getting commodity", p + "...")
          console.log(">> travelling...")
          await transitAuthority.travelToPlanet(p, { from: player })
          console.log(">> refueling...")
          const refuelCost = await transitAuthority.refuelCost()
          await transitAuthority.refuel({ from: player, value: refuelCost })

          const forgingAmount = await crystalAuthority.forgingAmount()
          let commodityBalance = await commodities.getBalance(p, { from: player })

          // Mint commodity until user has enough to forge
          while (commodityBalance.lt(forgingAmount)) {
            console.log(">> mining...")
            await mineCommodityXTimes(gia, 1, player, p)
            commodityBalance = await commodities.getBalance(p, { from: player })
          }

          // Unload unneeded overflow in a sell order, each iteration, to conserve cargo capacity
          if (commodityBalance.gt(forgingAmount)) {
            const planetToSell = getRandomPlanetToSell(p, tradedOnPlanet)
            await transitAuthority.travelToPlanet(planetToSell, { from: player })
            console.log(`>> unloading excess... (selling commodity ${p} on planet ${planetToSell})`)
            const randomPrice = Math.round(Math.random() * 10000000)
            await economicAuthority.createSellOrder(planetToSell, p, commodityBalance.sub(forgingAmount), randomPrice, { from: player })
          }
        }

        console.log(">> travelling to crystalAuthority...")
        await transitAuthority.travelToPlanet(255, { from: player })
        console.log(">> forging a crystal...")
        await crystalAuthority.forge({ from: player })
      }
    } catch (e) {
      console.error(e)
      return done()
    }

    console.log(`${player} forged a bunch of crystals and is now on planet 255`)
  }

  done()
}