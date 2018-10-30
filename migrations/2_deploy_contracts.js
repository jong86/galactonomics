const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const Commodity = artifacts.require("./Commodity.sol")
const commoditiesList = require('../util/commoditiesList')

module.exports = function(deployer) {

  // const commodityAddresses = commodities.map(commodity => commodity.address)

  // const gta = await deployer.deploy(GalacticTransitAuthority)
  // const gea = await deployer.deploy(GalacticEconomicAuthority, commodityAddresses, gta.address)
  // const gia = await deployer.deploy(GalacticIndustrialAuthority, commodityAddresses, gta.address)

  // await gta.setGEA(gea.address)
  // await gta.setGIA(gia.address)
  // commodities.forEach(async commodity => await commodity.setGEA(gea.address))
  // commodities.forEach(async commodity => await commodity.setGIA(gia.address))
};
