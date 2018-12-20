/*
  This script fast-forwards state to point where user can mine
*/

const TransitAuthority = artifacts.require("./TransitAuthority.sol")
const EconomicAuthority = artifacts.require("./EconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")

module.exports = async function(done) {
  const accounts = await web3.eth.accounts
  const bob = accounts[1]

  const transitAuthority = await TransitAuthority.deployed()
  const economicAuthority = await EconomicAuthority.deployed()
  const gia = await GalacticIndustrialAuthority.deployed()

  const costOfSpaceship = await transitAuthority.costOfSpaceship()

  try {
    await transitAuthority.buySpaceship('a', { from: bob, value: costOfSpaceship })
  } catch (e) {
    return console.error(e)
  }

  try {
    await transitAuthority.travelToPlanet(0, { from: bob })
  } catch (e) {
    return console.error(e)
  }

  console.log("ready to mine on planet 0")
  done()
}