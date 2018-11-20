const Commodities = artifacts.require("./Commodities.sol")
const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const ByzantianCrystal = artifacts.require('./items/ByzantianCrystal.sol')
const TempleAuthority = artifacts.require('./TempleAuthority.sol')
const Commodity = artifacts.require("./items/Commodity.sol")
const commodityNames = require('../utils/commodityNames')

module.exports = function(deployer) {
  deployer.then(async () => {
    // Deploy all commodities
    const commodityInstances = []
    for (let commodity of commodityNames) {
      commodityInstance = await deployer.deploy(Commodity, commodity.name, commodity.symbol);
      commodityInstances.push(commodityInstance);
    }

    // Get commodity contract addresses for sending to constructors of GEA and GIA
    const commodityAddresses = commodityInstances.map(commodityInstance => commodityInstance.address)

    // Deploy Commodities
    await deployer.deploy(Commodities, commodityAddresses)
    const commodities = await Commodities.deployed()

    // Deploy GTA
    await deployer.deploy(GalacticTransitAuthority)
    const gta = await GalacticTransitAuthority.deployed()

    // Deploy GEA and GIA
    await deployer.deploy(GalacticEconomicAuthority, commodities.address, gta.address)
    await deployer.deploy(GalacticIndustrialAuthority, commodities.address, gta.address)
    const gea = await GalacticEconomicAuthority.deployed()
    const gia = await GalacticIndustrialAuthority.deployed()

    // Set GEA and GIA access control
    await gta.setGEA(gea.address)
    await gta.setGIA(gia.address)
    await Promise.all(commodityInstances.map(instance => instance.setGEA(gea.address)))
    await Promise.all(commodityInstances.map(instance => instance.setGIA(gia.address)))

    // Deploy B. Crystal
    await deployer.deploy(ByzantianCrystal)
    const bCrystal = await ByzantianCrystal.deployed()

    // Deploy TA
    await deployer.deploy(TempleAuthority, commodities.address, gta.address, bCrystal.address)
    const temple = await TempleAuthority.deployed()

    // Set TA access control
    await bCrystal.setTA(temple.address)
    return Promise.all(commodityInstances.map(instance => instance.setTA(temple.address)))
  })
}