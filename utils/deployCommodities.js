const Commodity0 = artifacts.require("./commodities/Commodity0.sol")
const Commodity1 = artifacts.require("./commodities/Commodity1.sol")
const Commodity2 = artifacts.require("./commodities/Commodity2.sol")
const Commodity3 = artifacts.require("./commodities/Commodity3.sol")
const Commodity4 = artifacts.require("./commodities/Commodity4.sol")
const Commodity5 = artifacts.require("./commodities/Commodity5.sol")
const Commodity6 = artifacts.require("./commodities/Commodity6.sol")

function deployCommodities() {
  return new Promise(async (resolve, reject) => {
    const commodityArtifacts = [
      Commodity0,
      Commodity1,
      Commodity2,
      Commodity3,
      Commodity4,
      Commodity5,
      Commodity6,
    ]

    let commodityInstances

    try {
      commodityInstances = await Promise.all(
        commodityArtifacts.map(artifact => new Promise(async (resolve, reject) => {
          try {
            instance = await artifact.new()
          } catch (e) {
            return reject("Could not deploy commodity")
          }
          resolve(instance)
        })
      ))
    } catch (e) {
      return reject(e)
    }
    resolve(commodityInstances)
  })
}

module.exports = deployCommodities