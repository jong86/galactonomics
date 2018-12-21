const CommodityReg = artifacts.require("./CommodityReg.sol")
const CommodityEcon = artifacts.require("./CommodityEcon.sol")
const Crystal = artifacts.require('./items/Crystal.sol')
const CrystalReg = artifacts.require('./CrystalReg.sol')

module.exports = function(deployer) {
  deployer.then(async () => {
    // Deploy CommodityReg
    await deployer.deploy(CommodityReg)
    const commodityReg = await CommodityReg.deployed()

    // Deploy CommodityEcon
    await deployer.deploy(CommodityEcon, commodityReg.address)
    const commodityEcon = await CommodityEcon.deployed()

    // Deploy Crystal
    await deployer.deploy(Crystal)
    const crystal = await Crystal.deployed()

    // Deploy CrystalReg
    await deployer.deploy(CrystalReg, commodityReg.address, crystal.address)
    const crystalReg = await CrystalReg.deployed()

    return crystal.setCrystalReg(crystalReg.address)
  })
}