/*
  This script fast-forwards state to point where user can sell a commodity
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


  for (user of accounts) {
    try {
      await gta.buySpaceship('a', { from: user, value: costOfSpaceship })
    } catch (e) {
      console.error(e)
    }

    try {
      await gta.travelToPlanet(0, { from: user })
    } catch (e) {
      console.error(e)
    }

    const amount = await gia.getAmountRequired(0)
    try {
      await gia.investInProduction(0, { from: user, value: amount })
    } catch (e) {
      console.error(e)
    }

    await gia.mintCommodityFor(user, { from: owner })
    await gia.mintCommodityFor(user, { from: owner })
    await gia.mintCommodityFor(user, { from: owner })
    await gia.mintCommodityFor(user, { from: owner })
    await gia.mintCommodityFor(user, { from: owner })
    await gia.mintCommodityFor(user, { from: owner })
    await gia.mintCommodityFor(user, { from: owner })
    await gia.mintCommodityFor(user, { from: owner })

    try {
      await gta.travelToPlanet(1, { from: user })
    } catch (e) {
      console.error(e)
    }

    await gea.createSellOrder(1, 0, 2000, 10, { from: user })
  }

  done()
}