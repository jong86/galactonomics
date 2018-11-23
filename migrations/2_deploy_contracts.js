const Commodities = artifacts.require("./Commodities.sol")
const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const ByzantianCrystal = artifacts.require('./items/ByzantianCrystal.sol')
const TempleAuthority = artifacts.require('./TempleAuthority.sol')

module.exports = function(deployer) {
  deployer.then(async () => {
    // // Deploy Commodities
    // await deployer.deploy(Commodities)
    // const commodities = await Commodities.deployed()

    // // Deploy GTA
    // await deployer.deploy(GalacticTransitAuthority)
    // const gta = await GalacticTransitAuthority.deployed()

    // // Deploy GEA and GIA
    // await deployer.deploy(GalacticEconomicAuthority, commodities.address, gta.address)
    // await deployer.deploy(GalacticIndustrialAuthority, commodities.address, gta.address)
    // const gea = await GalacticEconomicAuthority.deployed()
    // const gia = await GalacticIndustrialAuthority.deployed()

    // // Deploy B. Crystal
    // await deployer.deploy(ByzantianCrystal)
    // const bCrystal = await ByzantianCrystal.deployed()

    // // Deploy TA
    // await deployer.deploy(TempleAuthority, commodities.address, gta.address, bCrystal.address)
    // const temple = await TempleAuthority.deployed()

    // // Set access controls
    // await gta.setGEA(gea.address)
    // await gta.setGIA(gia.address)
    // // await commodities.setAccessForAll(gea.address, gia.address, temple.address)
    // return bCrystal.setTA(temple.address)
  })
}