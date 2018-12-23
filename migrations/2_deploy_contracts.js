const CommodityReg = artifacts.require("./CommodityReg.sol")
const CommodityEcon = artifacts.require("./CommodityEcon.sol")
const CommodityInd = artifacts.require("./CommodityInd.sol")
const Crystal = artifacts.require('./Crystal.sol')
const CrystalEcon = artifacts.require('./CrystalEcon.sol')
const CrystalForge = artifacts.require('./CrystalForge.sol')

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(CommodityReg)
    const commodityReg = await CommodityReg.deployed()

    await deployer.deploy(CommodityEcon, commodityReg.address)
    const commodityEcon = await CommodityEcon.deployed()

    await deployer.deploy(CommodityInd, commodityReg.address)
    const commodityInd = await CommodityInd.deployed()

    await deployer.deploy(Crystal)
    const crystal = await Crystal.deployed()

    await deployer.deploy(CrystalEcon, commodityReg.address, crystal.address)
    const crystalEcon = await CrystalEcon.deployed()

    await deployer.deploy(CrystalForge, commodityReg.address, crystal.address)
    const crystalForge = await CrystalForge.deployed()

    return Promise.all([
      commodityReg.setCommodityEcon(commodityEcon.address),
      commodityReg.setCommodityInd(commodityInd.address),
      commodityReg.setCrystalForge(crystalForge.address),
      crystal.setCrystalForge(crystalForge.address),
      crystal.setCrystalEcon(crystalEcon.address),
    ])
  })
}