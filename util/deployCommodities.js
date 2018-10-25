const Commodity = artifacts.require("./Commodity.sol")

function deployCommodities() {
  return new Promise(async (resolve, reject) => {
    const array = [
      await Commodity.new("Fermented Gookala Eggs", "FGE", 0),
      await Commodity.new("Mufasta Goop", "MFG", 0),
      await Commodity.new("Byzantimum Crystals", "BZC", 0),
      await Commodity.new("Superalloy Sprockets", "SAS", 0),
      await Commodity.new("Arrakian Worm Milk", "AWM", 0),
      await Commodity.new("Auxilliary Omnireceptors", "AOR", 0),
      await Commodity.new("L-337 Nanobulators", "L3N", 0)
    ]

    resolve(array)
  })
}

module.exports = deployCommodities