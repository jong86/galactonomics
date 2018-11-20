/*
  This script fast-forwards state to point where user can invest in production
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

  // await gta.buySpaceship('a', { from: bob, value: costOfSpaceship })
  // await gta.travelToPlanet(0, { from: bob })

  try {
    await gta.buySpaceship('a', { from: alice, value: costOfSpaceship })
  } catch (e) {
    console.error(e)
  }

  try {
    await gta.travelToPlanet(0, { from: alice })
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