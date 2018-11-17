const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const ByzantianCrystal = artifacts.require('./items/ByzantianCrystal.sol')
const TempleAuthority = artifacts.require('./TempleAuthority.sol')
const Commodity = artifacts.require("./items/Commodity.sol")
const commodities = require('../utils/commodities')

module.exports = function(deployer) {
  deployer.then(async () => {
    const commodityInstances = []
    for (let commodity of commodities) {
      commodityInstance = await deployer.deploy(Commodity, commodity.name, commodity.symbol);
      commodityInstances.push(commodityInstance);
    }

    // Get commodity contract addresses for sending to constructors of GEA and GIA
    const commodityAddresses = commodityInstances.map(commodityInstance => commodityInstance.address)

    // Deploy GTA
    await deployer.deploy(GalacticTransitAuthority)
    const gta = await GalacticTransitAuthority.deployed()

    // Deploy GEA and GIA
    await deployer.deploy(GalacticEconomicAuthority, commodityAddresses, gta.address, { gas: 6000000 } )
    await deployer.deploy(GalacticIndustrialAuthority, commodityAddresses, gta.address, { gas: 6000000 })
    const gea = await GalacticEconomicAuthority.deployed()
    const gia = await GalacticIndustrialAuthority.deployed()

    // Set GEA and GIA access control
    await gta.setGEA(gea.address)
    await gta.setGIA(gia.address)
    await Promise.all(commodityInstances.map(instance => instance.setGEA(gea.address)))
    await Promise.all(commodityInstances.map(instance => instance.setGIA(gia.address)))

    // Deploy B. Crystal
    await deployer.deploy(ByzantianCrystal, { gas: 6000000 })
    const bCrystal = await ByzantianCrystal.deployed()

    // Deploy TA
    await deployer.deploy(TempleAuthority, commodityAddresses, gta.address, bCrystal.address, { gas: 6000000 })
    const temple = await TempleAuthority.deployed()

    // Set TA access control
    await bCrystal.setTA(temple.address)
    return Promise.all(commodityInstances.map(instance => instance.setTA(temple.address)))
  })
}