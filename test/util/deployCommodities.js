const Commodity = artifacts.require("./items/Commodity.sol")
const commodityData = require('../../utils/commodityData')

function deployCommodities(target) {
  return new Promise(async (resolve, reject) => {
    const commodityInstances = []

    try {
      for (let commodity of commodityData) {
        commodityInstance = await Commodity.new(
          commodity.name,
          commodity.symbol,
          commodity.startingReward,
          target,
        )
        commodityInstances.push(commodityInstance)
      }
    } catch (e) {
      reject(e)
    }

    resolve(commodityInstances)
  })
}

module.exports = deployCommodities