const TransitAuthority = artifacts.require("./TransitAuthority.sol")
const EconomicAuthority = artifacts.require("./EconomicAuthority.sol")
const CommodityAuthority = artifacts.require("./CommodityAuthority.sol")
const { mine } = require('./util/testUtils')

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
    const commodityId = 0
    let response, balance, nonce, miningData, hash

    try {
      const results = await mine(commodityAuthority, commodityId, player1)
      nonce = results.nonce
      miningData = results.miningData
      hash = results.hash
    } catch (e) {
      assert(false, e)
    }

    const miningReward = miningData[1]
    console.log('nonce', nonce);
    try {
      response = await commodityAuthority.submitPOW(nonce, { from: player1 })
    } catch (e) {
      assert(false, e)
    }
    const hashFromSolidity = response.logs.find(log => log.event === 'CommodityMined').args._hash

    try {
      balance = await commodityAuthority.balanceOf(player1, commodityId)
    } catch (e) {
      assert(false, e)
    }

    assert.equal(balance.toString(), miningReward.toString(), "did not receive mining reward")
    assert.equal('0x' + hash, hashFromSolidity, "hash from javascript does not match hash from solidity")
  })

  it("does not mint commodity if user submits invalid proof-of-work", async () => {
    const commodityId = 3
    const balanceBefore = await commodityAuthority.balanceOf(player1, commodityId)

    try {
      await commodityAuthority.submitPOW(0, { from: player1 })
    } catch (e) {
      // Expecting this to fail so eating error
    }

    const balanceAfter = await commodityAuthority.balanceOf(player1, commodityId)
    assert.equal(balanceBefore.toString(), balanceAfter.toString(), "received mining reward")
  })
})
