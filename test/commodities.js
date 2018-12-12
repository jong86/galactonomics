const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const Commodities = artifacts.require("./Commodities.sol")
const { fillUpCargoByMining, mineCommodityXTimes } = require('./util/testUtils')
const sha256 = require('js-sha256');

contract("Commodities", accounts => {
  let gta, gea, commodities
  const player1 = accounts[1]
  const player2 = accounts[2]

  beforeEach(async() => {
    // Deploy main contracts
    gta = await GalacticTransitAuthority.new()
    commodities = await Commodities.new(gta.address)
    gea = await GalacticEconomicAuthority.new(commodities.address, gta.address)
    // Set access roles
    await gta.setGEA(gea.address)

    const costOfSpaceship = await gta.costOfSpaceship()
    await gta.buySpaceship("A", { from: player1, value: costOfSpaceship })
    await gta.buySpaceship("B", { from: player2, value: costOfSpaceship })
    await gta.travelToPlanet(0, { from: player1 })
    await gta.travelToPlanet(0, { from: player2 })
  })

  it("mints commodity for player when player submits valid proof-of-work", async () => {
    const miningData = await commodities.getCommodity(0, { from: player1 })
    const miningReward = miningData[1]
    const miningTarget = miningData[2]
    let prevHash = miningData[3]

    if (prevHash.substr(2, 2) === '0x') {
      prevHash = prevHash.substr(2)
    }

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

    const response = await commodities.mine(String(nonce), { from: player1 })
    const hashFromSolidity = response.logs.find(log => log.event === 'CommodityMined').args._hash

    const balance = await commodities.balanceOf(player1, 0)

    assert.equal(balance.toString(), miningReward.toString(), "did not receive mining reward")
    assert.equal('0x' + hash, hashFromSolidity, "hash from javascript does not match hash from solidity")
  })

  it("does not mint commodity if user submits invalid proof-of-work", async () => {
    const balanceBefore = await commodities.balanceOf(player1, 0)
    try {
      await commodities.mine(0, { from: player1 })
    } catch (e) {}
    const balanceAfter = await commodities.balanceOf(player1, 0)
    assert.equal(balanceBefore.toString(), balanceAfter.toString(), "received mining reward")
  })

  it("does not mint if player cannot fit the mining reward in spaceship's cargo", async () => {
    await fillUpCargoByMining(commodities, gta, player1, 0)
    const balanceBefore = await commodities.balanceOf(player1, 0)

    const miningData = await commodities.getCommodity(0, { from: player1 })
    const miningTarget = miningData[2]
    const prevHash = miningData[3]

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
      await commodities.mine(String(nonce), { from: player1 })
    } catch (e) {}

    const balanceAfter = await commodities.balanceOf(player1, 0)

    assert.equal(
      balanceBefore.toString(),
      balanceAfter.toString(),
      "balance should not have changed after calling mine()"
    )
  })
})
