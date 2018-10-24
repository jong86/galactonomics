const Commodity = artifacts.require("./Commodity.sol")

async function deployCommodities() {
  return [
    await Commodity.new("Fermented Gookala Eggs", "FGE", 0),
    await Commodity.new("Mufasta Goop", "MFG", 0),
    await Commodity.new("Byzantimum Crystals", "BZC", 0),
    await Commodity.new("Superalloy Sprockets", "SAS", 0),
    await Commodity.new("Arrakian Worm Milk", "AWM", 0),
    await Commodity.new("Auxilliary Omnireceptors", "AOR", 0),
    await Commodity.new("L-337 Nanobulators", "L3N", 0)
  ]
}

module.exports = deployCommodities