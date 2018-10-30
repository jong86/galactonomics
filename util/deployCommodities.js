const Commodity = artifacts.require("./Commodity.sol")

function deployCommodities() {
  return new Promise(async (resolve, reject) => {
    const array = [
      await Commodity.new("Fermented Gookala Eggs", "FGE"),
      await Commodity.new("Mufasta Goop", "MFG"),
      await Commodity.new("Byzantimum Crystals", "BZC"),
      await Commodity.new("Superalloy Sprockets", "SAS"),
      await Commodity.new("Arrakian Worm Milk", "AWM"),
      await Commodity.new("Auxilliary Omnireceptors", "AOR"),
      await Commodity.new("L-337 Nanobulators", "L3N")
    ]

    resolve(array)
  })
}

module.exports = deployCommodities