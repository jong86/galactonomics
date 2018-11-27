/*
  This script gets state to point where account[1] has enough commodities
  to forge a crystal
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
    console.log("Bob is getting all the commodities...")
    for (let i = 0; i <= 6; i++) {
      console.log("Getting commodity", i + "...")
      console.log(">> travelling...")
      await gta.travelToPlanet(i, { from: bob })
      console.log(">> refueling...")
      const refuelCost = await gta.refuelCost()
      await gta.refuel({ from: bob, value: refuelCost })

      const forgingAmount = await temple.forgingAmount()
      let commodityBalance = await commodities.getBalance(i, { from: bob })

      // Mint commodity until user has enough to forge
      while (commodityBalance.lt(forgingAmount)) {
        console.log(">> mining...")
        await mineCommodityXTimes(gia, 4, bob)
        commodityBalance = await commodities.getBalance(i, { from: bob })
      }

      // Unload unneeded overflow in a sell order, each iteration, to conserve cargo capacity
      if (commodityBalance.gt(forgingAmount)) {
        console.log(">> unloading excess...")
        await gea.createSellOrder(i, i, commodityBalance.sub(forgingAmount), 100, { from: bob })
      }
    }
  } catch (e) {
    console.error(e)
  }

  await gta.travelToPlanet(255, { from: bob })

  console.log("Minted all 7 commodities and now on planet 255")

  done()
}