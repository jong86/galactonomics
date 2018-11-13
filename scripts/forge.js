/*
  This script gets state to point where account[1] has enough commodities
  to forge a crystal
*/

const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")

module.exports = async function(done) {
  const accounts = await web3.eth.accounts
  const owner = accounts[0]
  console.log('owner', owner);
  const bob = accounts[1]
  const alice = accounts[2]
  const mallory = accounts[3]

  const gta = await GalacticTransitAuthority.deployed()
  const gea = await GalacticEconomicAuthority.deployed()
  const gia = await GalacticIndustrialAuthority.deployed()

  const costOfSpaceship = await gta.costOfSpaceship()
  await gta.buySpaceship('a', { from: alice, value: costOfSpaceship })

  try {
    console.log("Bob is getting all the commodities...")
    for (let i = 0; i <= 6; i++) {
      await gta.travelToPlanet(i, { from: bob })
      const refuelCost = await gta.refuelCost()
      await gta.refuel({ from: bob, value: refuelCost })

      const forgingAmount = await temple.forgingAmount()
      let commodityBalance = await gea.getCommodityBalance(i, { from: bob })

      // Mint commodity until user has enough to forge
      while (commodityBalance.lt(forgingAmount)) {
        const commodity = await gea.getCommodity(i)
        const miningCost = commodity[3]
        const miningDuration = commodity[5]
        await gia.investInProduction(i, { from: bob, value: miningCost })
        await mintCommodityXTimes(gia, miningDuration.toNumber(), bob)
        commodityBalance = await gea.getCommodityBalance(i, { from: bob })
      }

      // Unload unneeded overflow in a sell order, each iteration, to conserve cargo capacity
      if (commodityBalance.gt(forgingAmount)) {
        await gea.createSellOrder(i, i, commodityBalance.sub(forgingAmount), 100, { from: bob })
      }
    }
    resolve()
  } catch (e) {
    reject(e)
  }
  

  done()
}