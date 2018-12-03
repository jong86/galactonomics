const Commodities = artifacts.require("./Commodities.sol")
const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const { fillUpCargoByMining, mineCommodityXTimes } = require('./util/testUtils')
const deployCommodities = require('./util/deployCommodities')
const sha256 = require('js-sha256');

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
    const allCommodities = await deployCommodities('0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
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
    const miningData = await gia.getMiningData({ from: player1 })
    const miningReward = miningData[0]
    const miningTarget = miningData[1]
    const prevHash = miningData[2]

    let nonce = 3500
    let hash
    do {
      nonce++
      hash = sha256(
        nonce.toString() +
        (0).toString() +
        prevHash +
        player1.substring(2)
      )
    } while (parseInt(hash, 16) >= parseInt(miningTarget, 16))

    console.log('prevHash', prevHash);
    console.log('hash', hash);

    const response = await gia.submitProofOfWork(String(nonce), { from: player1 })
    const hashFromSolidity = response.logs.find(log => log.event === 'CommodityMined').args._hash

    const balance = await commodities.getBalance(0, { from: player1 })

    assert.equal(balance.toString(), miningReward.toString(), "did not receive mining reward")
    assert.equal('0x' + hash, hashFromSolidity, "hash from javascript does not match hash from solidity")
  })

  it("does not mint commodity if user submits invalid proof-of-work", async () => {
    const balanceBefore = await commodities.getBalance(0, { from: player1 })
    try {
      await gia.submitProofOfWork(0, { from: player1 })
    } catch (e) {}
    const balanceAfter = await commodities.getBalance(0, { from: player1 })
    assert.equal(balanceBefore.toString(), balanceAfter.toString(), "did not receive mining reward")
  })

  it("does not mint if player cannot fit the mining reward in spaceship's cargo", async () => {
    await fillUpCargoByMining(commodities, gta, gia, player1, 0)
    const balanceBefore = await commodities.getBalance(0, { from: player1 })

    const miningData = await gia.getMiningData({ from: player1 })
    const miningTarget = miningData[1]
    const prevHash = miningData[2]

    let nonce = 3500
    let hash
    do {
      nonce++
      hash = sha256(
        nonce.toString() +
        (0).toString() +
        prevHash +
        player1.substring(2)
      )
    } while (parseInt(hash, 16) >= parseInt(miningTarget, 16))

    try {
      await gia.submitProofOfWork(String(nonce), { from: player1 })
    } catch (e) {}

    const balanceAfter = await commodities.getBalance(0, { from: player1 })

    assert.equal(
      balanceBefore.toString(),
      balanceAfter.toString(),
      "balance should not have changed after calling submitProofOfWork"
    )
  })
})
