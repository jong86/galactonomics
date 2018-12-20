/*
  This script fast-forwards state to point where user can invest in production
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

  // await transitAuthority.buySpaceship('a', { from: bob, value: costOfSpaceship })
  // await transitAuthority.travelToPlanet(0, { from: bob })

  try {
    await transitAuthority.buySpaceship('a', { from: alice, value: costOfSpaceship })
  } catch (e) {
    console.error(e)
  }

  try {
    await transitAuthority.travelToPlanet(0, { from: alice })
  } catch (e) {
    console.error(e)
  }

  // const amount = await commodities.getMiningCost(0)
  // try {
  //   await gia.investInProduction(0, { from: alice, value: amount })
  // } catch (e) {
  //   console.error(e)
  // }

  done()
}