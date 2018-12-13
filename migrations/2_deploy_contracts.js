const Commodity = artifacts.require("./items/Commodity.sol")
const Commodities = artifacts.require("./Commodities.sol")
const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const ByzantianCrystal = artifacts.require('./items/ByzantianCrystal.sol')
const TempleAuthority = artifacts.require('./TempleAuthority.sol')
const commodityData = require('../utils/commodityData')

module.exports = function(deployer) {
  deployer.then(async () => {
    // Deploy GTA
    await deployer.deploy(GalacticTransitAuthority)
    const gta = await GalacticTransitAuthority.deployed()

    // Deploy Commodities
    await deployer.deploy(Commodities, gta.address)
    const commodities = await Commodities.deployed()

    // Deploy GEA
    await deployer.deploy(GalacticEconomicAuthority, commodities.address, gta.address)
    const gea = await GalacticEconomicAuthority.deployed()

    // Deploy B. Crystal
    await deployer.deploy(ByzantianCrystal)
    const bCrystal = await ByzantianCrystal.deployed()

    // Deploy TA
    await deployer.deploy(TempleAuthority, commodities.address, gta.address, bCrystal.address)
    const temple = await TempleAuthority.deployed()

    await gta.setGEA(gea.address)
    return bCrystal.setTA(temple.address)
  })
}