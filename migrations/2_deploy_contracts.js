const CommodityAuthority = artifacts.require("./CommodityAuthority.sol")
const TransitAuthority = artifacts.require("./TransitAuthority.sol")
const EconomicAuthority = artifacts.require("./EconomicAuthority.sol")
const Crystal = artifacts.require('./items/Crystal.sol')
const CrystalAuthority = artifacts.require('./CrystalAuthority.sol')

module.exports = function(deployer) {
  deployer.then(async () => {
    // Deploy GTA
    await deployer.deploy(TransitAuthority)
    const transitAuthority = await TransitAuthority.deployed()

    // Deploy CommodityAuthority
    await deployer.deploy(CommodityAuthority, transitAuthority.address)
    const commodityAuthority = await CommodityAuthority.deployed()

    // Deploy GEA
    await deployer.deploy(EconomicAuthority, commodityAuthority.address, transitAuthority.address)
    const economicAuthority = await EconomicAuthority.deployed()

    // Deploy B. Crystal
    await deployer.deploy(Crystal)
    const crystal = await Crystal.deployed()

    // Deploy TA
    await deployer.deploy(CrystalAuthority, commodityAuthority.address, transitAuthority.address, crystal.address)
    const crystalAuthority = await CrystalAuthority.deployed()

    await transitAuthority.setEconomicAuthority(economicAuthority.address)
    return crystal.setCrystalAuthority(crystalAuthority.address)
  })
}