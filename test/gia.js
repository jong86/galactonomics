const Commodities = artifacts.require("./Commodities.sol")
const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const { fillUpCargoByMining, mineCommodityXTimes } = require('./util/testUtils')
const deployCommodities = require('./util/deployCommodities')
const sha256 = require('js-sha256');

const maxGas = 7000000

contract("GalacticIndustrialAuthority", accounts => {
  let gta, gea, gia, commodities
  const owner = accounts[0]
  const player1 = accounts[1]
  const player2 = accounts[2]
  const nonPlayer = accounts[3]
  const qty = 1000
  const price = 350

  beforeEach(async() => {
    // Deploy individual commodity addresses
    const allCommodities = await deployCommodities()
    const commodityAddresses = allCommodities.map(commodity => commodity.address)
    // Deploy main contracts
    commodities = await Commodities.new(commodityAddresses)
    gta = await GalacticTransitAuthority.new()
    gea = await GalacticEconomicAuthority.new(commodities.address, gta.address)
    gia = await GalacticIndustrialAuthority.new(commodities.address, gta.address)
    // Set access roles
    await gta.setGEA(gea.address)
    await gta.setGIA(gia.address)
    allCommodities.forEach(async commodity => await commodity.setGEA(gea.address))
    allCommodities.forEach(async commodity => await commodity.setGIA(gia.address))

    const costOfSpaceship = await gta.costOfSpaceship()
    await gta.buySpaceship("A", { from: player1, value: costOfSpaceship })
    await gta.buySpaceship("B", { from: player2, value: costOfSpaceship })
    await gta.travelToPlanet(0, { from: player1 })
    await gta.travelToPlanet(0, { from: player2 })
  })

  it("mints commodity for player when player submits valid proof-of-work", async () => {
    const miningTarget = await commodities.getMiningTarget(0)

    let nonce = 0
    let hash
    do {
      nonce++
      hash = sha256(String(nonce))
    } while (parseInt(hash, 16) >= parseInt(miningTarget, 16))

    await gia.submitProofOfWork(String(nonce), { from: player1 })

    const balance = await commodities.getBalance(0, { from: player1 })
    const miningReward = await commodities.getMiningReward(0)

    assert.equal(balance.toString(), miningReward.toString(), "did not receive mining reward")
  })
})
