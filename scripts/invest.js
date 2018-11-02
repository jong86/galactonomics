const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")

module.exports = async function(done) {
  const accounts = await web3.eth.accounts
  const owner = accounts[0]
  const bob = accounts[1]
  const alice = accounts[2]
  
  const gta = await GalacticTransitAuthority.deployed()
  // const gea = await GalacticEconomicAuthority.deployed()
  // const gia = await GalacticIndustrialAuthority.deployed()

  const costOfSpaceship = await gta.costOfSpaceship()

  // await gta.buySpaceship('a', { from: bob, value: costOfSpaceship })
  // await gta.travelToPlanet(0, { from: bob })

  await gta.buySpaceship('a', { from: alice, value: costOfSpaceship })
  await gta.travelToPlanet(0, { from: alice })

  done()
}