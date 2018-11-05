const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const Commodity0 = artifacts.require("./commodities/Commodity0.sol")
const Commodity1 = artifacts.require("./commodities/Commodity1.sol")
const Commodity2 = artifacts.require("./commodities/Commodity2.sol")
const Commodity3 = artifacts.require("./commodities/Commodity3.sol")
const Commodity4 = artifacts.require("./commodities/Commodity4.sol")
const Commodity5 = artifacts.require("./commodities/Commodity5.sol")
const Commodity6 = artifacts.require("./commodities/Commodity6.sol")

module.exports = function(deployer) {
  deployer.then(async () => {
    // There are separate contracts for each commodity because truffle doesn't seem to work
    // with multiple copies of the same contract at the current date
    // https://github.com/trufflesuite/truffle/issues/237

    const commodityArtifacts = [
      Commodity0,
      Commodity1,
      Commodity2,
      Commodity3,
      Commodity4,
      Commodity5,
      Commodity6,
    ]

    // Deploy each commodity contract
    await Promise.all(
      commodityArtifacts.map(artifact => deployer.deploy(artifact)
    ))

    // Store instances of each commodity contract
    const commodityInstances = await Promise.all(
      commodityArtifacts.map(artifact => new Promise(async (resolve, reject) => {
        try {
          instance = await artifact.deployed()
          resolve(instance)
        } catch (e) {
          reject("Could not deploy commodity")
        }
      })
    ))


    // Get commodity contract addresses for sending to constructors of GEA and GIA
    const commodityAddresses = commodityInstances.map(commodityInstance => commodityInstance.address)

    // Deploy GTA
    await deployer.deploy(GalacticTransitAuthority)
    // Store GTA instance
    const gta = await GalacticTransitAuthority.deployed()

    // Deploy GEA and GIA
    await deployer.deploy(GalacticEconomicAuthority, commodityAddresses, gta.address, { gas: 6000000 } )
    await deployer.deploy(GalacticIndustrialAuthority, commodityAddresses, gta.address, { gas: 6000000 })

    // Set GEA and GIA for permissions
    const gea = await GalacticEconomicAuthority.deployed()
    const gia = await GalacticIndustrialAuthority.deployed()
    await gta.setGEA(gea.address)
    await gta.setGIA(gia.address)
    await Promise.all(commodityInstances.map(instance => instance.setGEA(gea.address)))
    return Promise.all(commodityInstances.map(instance => instance.setGIA(gia.address)))
  })
};
