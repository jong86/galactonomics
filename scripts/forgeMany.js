/*
  This script gets state to point where account[1] owns many crystals
*/

const Commodities = artifacts.require('./Commodities.sol')
const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const TempleAuthority = artifacts.require('./TempleAuthority.sol')

const { mineCommodityXTimes } = require('../test/util/testUtils')

module.exports = async function(done) {
  const accounts = await web3.eth.accounts
  const bob = accounts[1]
  let gta, gea, gia, temple

  try {
    commodities = await Commodities.deployed()
    gta = await GalacticTransitAuthority.deployed()
    gea = await GalacticEconomicAuthority.deployed()
    gia = await GalacticIndustrialAuthority.deployed()
    temple = await TempleAuthority.deployed()
    const costOfSpaceship = await gta.costOfSpaceship()
    await gta.buySpaceship('a', { from: bob, value: costOfSpaceship })
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
          console.log(">> unloading excess...")
          await gea.createSellOrder(p, p, commodityBalance.sub(forgingAmount), 100, { from: bob })
        }
      }

      console.log(">> travelling to temple...")
      await gta.travelToPlanet(255, { from: bob })
      console.log(">> forging a crystal...")
      await temple.forge({ from: bob })
    }
  } catch (e) {
    console.error(e)
    return done()
  }

  console.log(`${bob} forged a bunch of crystals and is now on planet 255`)

  done()
}