/*
  This script fast-forwards state to point where user can mine
*/

const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")

module.exports = async function(done) {
  const accounts = await web3.eth.accounts
  const bob = accounts[1]

  const gta = await GalacticTransitAuthority.deployed()
  const gea = await GalacticEconomicAuthority.deployed()
  const gia = await GalacticIndustrialAuthority.deployed()

  const costOfSpaceship = await gta.costOfSpaceship()

  try {
    await gta.buySpaceship('a', { from: bob, value: costOfSpaceship })
  } catch (e) {
    return console.error(e)
  }

  try {
    await gta.travelToPlanet(0, { from: bob })
  } catch (e) {
    return console.error(e)
  }

  console.log("ready to mine on planet 0")
  done()
}