/*
  This scripts gets state to point with many orders on each planet, to test viewing of prices on planets
*/

const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")

module.exports = async function(done) {
  const accounts = await web3.eth.accounts
  const owner = accounts[0]

  const gta = await GalacticTransitAuthority.deployed()
  const gea = await GalacticEconomicAuthority.deployed()
  const gia = await GalacticIndustrialAuthority.deployed()

  const costOfSpaceship = await gta.costOfSpaceship()

  const planets = [0, 1, 2, 3, 4, 5, 6]

  for (let user of accounts) {
    await gta.buySpaceship('a', { from: user, value: costOfSpaceship })
    console.log(user, 'bought a spaceship')
  }

  for (let user of accounts) {
    console.log(user, 'is now travelling, investing, and creating orders...')

    await gta.travelToPlanet(0, { from: user })

    for (let planet = 0; planet < planets.length; planet++) {
      const nextPlanet = planet === 6 ? 0 : planet + 1

      try {
        const amount = await gia.getMiningCost(planet)
        await gia.investInProduction(planet, { from: user, value: amount })

        console.log('minting commodity', planet,  'for', user, '...')
        for (let i = 0; i < 8; i++) {
          await gia.mintCommodityFor(user, { from: owner })
        }

        console.log(user, 'is now travelling to planet', nextPlanet)
        await gta.travelToPlanet(nextPlanet, { from: user })
        const prevPlanet = planet

        const refuelCost = await gta.refuelCost()
        await gta.refuel({ from: user, value: refuelCost })

        const balance = await gea.getCommodityBalance(prevPlanet, { from: user })

        console.log(user, 'is unloading all previously mined commodity in a sell order')
        await gea.createSellOrder(nextPlanet, prevPlanet, balance, 100, { from: user })

      } catch (e) {
        console.error(e)
      }
    }
  }

  done()
}