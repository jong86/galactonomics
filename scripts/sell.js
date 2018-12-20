/*
  This script fast-forwards state to point where user can sell a commodity
*/

const TransitAuthority = artifacts.require("./TransitAuthority.sol")
const EconomicAuthority = artifacts.require("./EconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")

module.exports = async function(done) {
  const accounts = await web3.eth.accounts
  const owner = accounts[0]

  console.log('owner', owner);
  const bob = accounts[1]
  const alice = accounts[2]
  const mallory = accounts[3]

  const transitAuthority = await TransitAuthority.deployed()
  const economicAuthority = await EconomicAuthority.deployed()
  const gia = await GalacticIndustrialAuthority.deployed()

  const costOfSpaceship = await transitAuthority.costOfSpaceship()


  for (user of accounts) {
    try {
      await transitAuthority.buySpaceship('a', { from: user, value: costOfSpaceship })
    } catch (e) {
      console.error(e)
    }

    try {
      await transitAuthority.travelToPlanet(0, { from: user })
    } catch (e) {
      console.error(e)
    }

    const amount = await commodities.getMiningCost(0)
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
      await transitAuthority.travelToPlanet(1, { from: user })
    } catch (e) {
      console.error(e)
    }

    await economicAuthority.createSellOrder(1, 0, 2000, 10, { from: user })
  }

  done()
}