const Commodity = artifacts.require("./Commodity.sol")
const commodities = require('../utils/commodities')

function deployCommodities() {
  return new Promise(async (resolve, reject) => {
    const commodityInstances = []

    try {
      for (let commodity of commodities) {
        commodityInstance = await Commodity.new(commodity.name, commodity.symbol);
        commodityInstances.push(commodityInstance);
      }
    } catch (e) {
      reject(e)
    }

    resolve(commodityInstances)
  })
}

module.exports = deployCommodities