const Commodity = artifacts.require("./items/Commodity.sol")
const commodityNames = require('./commodityNames')

function deployCommodities() {
  return new Promise(async (resolve, reject) => {
    const commodityInstances = []

    try {
      for (let commodity of commodityNames) {
        commodityInstance = await Commodity.new(commodity.name, commodity.symbol, { gas: 6000000 });
        commodityInstances.push(commodityInstance);
      }
    } catch (e) {
      reject(e)
    }

    resolve(commodityInstances)
  })
}

module.exports = deployCommodities