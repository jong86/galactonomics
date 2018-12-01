const Commodity = artifacts.require("./items/Commodity.sol")
const Commodities = artifacts.require("./Commodities.sol")
const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const ByzantianCrystal = artifacts.require('./items/ByzantianCrystal.sol')
const TempleAuthority = artifacts.require('./TempleAuthority.sol')
const commodityData = require('../utils/commodityData')

module.exports = function(deployer) {
  deployer.then(async () => {
    // Deploy each Commodity
    const commodityInstances = await Promise.all(commodityData.map(commodity =>
      new Promise(async (resolve, reject) => {
        try {
          await deployer.deploy(Commodity, commodity.name, commodity.symbol, commodity.startingReward, commodity.startingTarget);
          resolve(await Commodity.deployed())
        } catch (e) {
          reject(e)
        }
      })
    ))

    const commodityAddresses = commodityInstances.map(commodity => commodity.address)

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

    // Deploy B. Crystal
    await deployer.deploy(ByzantianCrystal)
    const bCrystal = await ByzantianCrystal.deployed()

    // Deploy TA
    await deployer.deploy(TempleAuthority, commodities.address, gta.address, bCrystal.address)
    const temple = await TempleAuthority.deployed()

    // Set access controls
    // for (const commodity of commodityInstances) {
    //   await commodity.setGEA(gea.address)
    //   await commodity.setGIA(gia.address)
    //   await commodity.setTA(temple.address)
    // }

    await Promise.all(commodityInstances.map(commodity =>
      new Promise.all(async (resolve, reject) => {
        try {
          await commodity.setGEA(gea.address)
          await commodity.setGIA(gia.address)
          await commodity.setTA(temple.address)
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    ))

    await gta.setGEA(gea.address)
    await gta.setGIA(gia.address)
    return bCrystal.setTA(temple.address)
  })
}