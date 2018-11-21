/*
  This scripts gets state to point with many orders on each planet, to test viewing of prices on planets
*/

const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")

module.exports = async function(done) {
  const accounts = await web3.eth.accounts
  const owner = accounts[0]
  const sellingAccounts = accounts.slice(0, 4)

  const gta = await GalacticTransitAuthority.deployed()
  const gea = await GalacticEconomicAuthority.deployed()
  const gia = await GalacticIndustrialAuthority.deployed()

  const costOfSpaceship = await gta.costOfSpaceship()

  const planets = [0, 1, 2, 3, 4, 5, 6]

  for (let user of sellingAccounts) {
    await gta.buySpaceship('a', { from: user, value: costOfSpaceship })
    console.log(user, 'bought a spaceship')
  }

  for (let xPlanets = 1; xPlanets < planets.length; xPlanets++) {
    for (let user of sellingAccounts) {
      console.log(user, 'is now travelling/mining/selling. (Travelling', xPlanets, 'planet indexes at time)')

      // Start every round of trips at planet 0
      let planet = 0
      await gta.travelToPlanet(planet, { from: user })

      let tripsLeft = 7
      while (tripsLeft) {
        try {
          // Mine the commodity
          const amount = await commodities.getMiningCost(planet)
          await gia.investInProduction(planet, { from: user, value: amount })
          console.log('minting commodity', planet, 'for', user, '...')
          for (let i = 0; i < 8; i++) {
            await gia.mintCommodityFor(user, { from: owner })
          }

          // Travel to the next planet (and refuel)
          const prevPlanet = planet
          planet = planet+xPlanets > 6 ? 0+(xPlanets-1) : planet+xPlanets
          console.log(user, 'is now travelling to planet', planet)
          await gta.travelToPlanet(planet, { from: user })
          const refuelCost = await gta.refuelCost()
          await gta.refuel({ from: user, value: refuelCost })

          // Unload commodity from previous planet on this new planet
          const balance = await commodities.getBalance(prevPlanet, { from: user })
          console.log(user, 'is unloading all previously mined commodity in a sell order')
          await gea.createSellOrder(
            planet,
            prevPlanet,
            balance,
            Math.floor(Math.random() * 1000),
            { from: user }
          )

        } catch (e) {
          console.error(e)
        }

        tripsLeft--
      }
    }
  }

  done()
}