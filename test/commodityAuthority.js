const TransitAuthority = artifacts.require("./TransitAuthority.sol")
const EconomicAuthority = artifacts.require("./EconomicAuthority.sol")
const CommodityAuthority = artifacts.require("./CommodityAuthority.sol")
const { fillUpCargoByMining } = require('./util/testUtils')
const sha256 = require('js-sha256');

contract("CommodityAuthority", accounts => {
  let transitAuthority, economicAuthority, commodityAuthority
  const player1 = accounts[1]
  const player2 = accounts[2]

  beforeEach(async() => {
    // Deploy main contracts
    transitAuthority = await TransitAuthority.new()
    commodityAuthority = await CommodityAuthority.new(transitAuthority.address)
    economicAuthority = await EconomicAuthority.new(commodityAuthority.address, transitAuthority.address)
    // Set access roles
    await transitAuthority.setEconomicAuthority(economicAuthority.address)

    const costOfSpaceship = await transitAuthority.costOfSpaceship()
    await transitAuthority.buySpaceship("A", { from: player1, value: costOfSpaceship })
    await transitAuthority.buySpaceship("B", { from: player2, value: costOfSpaceship })
    await transitAuthority.travelToPlanet(0, { from: player1 })
    await transitAuthority.travelToPlanet(0, { from: player2 })
  })

  it("mints commodity for player when player submits valid proof-of-work", async () => {
    const miningData = await commodityAuthority.getCommodity(0, { from: player1 })
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

    const response = await commodityAuthority.mine(String(nonce), { from: player1 })
    const hashFromSolidity = response.logs.find(log => log.event === 'CommodityMined').args._hash

    const balance = await commodityAuthority.balanceOf(player1, 0)

    assert.equal(balance.toString(), miningReward.toString(), "did not receive mining reward")
    assert.equal('0x' + hash, hashFromSolidity, "hash from javascript does not match hash from solidity")
  })

  it("does not mint commodity if user submits invalid proof-of-work", async () => {
    const balanceBefore = await commodityAuthority.balanceOf(player1, 0)
    try {
      await commodityAuthority.mine(0, { from: player1 })
    } catch (e) {}
    const balanceAfter = await commodityAuthority.balanceOf(player1, 0)
    assert.equal(balanceBefore.toString(), balanceAfter.toString(), "received mining reward")
  })

  it("does not mint if player cannot fit the mining reward in spaceship's cargo", async () => {
    await fillUpCargoByMining(commodityAuthority, transitAuthority, player1, 0)
    const balanceBefore = await commodityAuthority.balanceOf(player1, 0)

    const miningData = await commodityAuthority.getCommodity(0, { from: player1 })
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
      await commodityAuthority.mine(String(nonce), { from: player1 })
    } catch (e) {}

    const balanceAfter = await commodityAuthority.balanceOf(player1, 0)

    assert.equal(
      balanceBefore.toString(),
      balanceAfter.toString(),
      "balance should not have changed after calling mine()"
    )
  })
})
