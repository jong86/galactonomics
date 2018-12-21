const CommodityReg = artifacts.require("./CommodityReg.sol")
const { mine } = require('./util/testUtils')

contract("CommodityReg", accounts => {
  let commodityReg
  const player1 = accounts[1]
  const player2 = accounts[2]

  beforeEach(async() => {
    commodityReg = await CommodityReg.new()
  })

  it("mints commodity for player when player submits valid proof-of-work", async () => {
    const commodityId = web3.toBigNumber(0)
    let response, balance, nonce, miningData, hash

    try {
      const results = await mine(commodityReg, commodityId, player1)
      nonce = results.nonce
      miningData = results.miningData
      hash = results.hash
    } catch (e) {
      assert(false, e.toString())
    }

    const miningReward = miningData[1]
    const totalSupplyBefore = await commodityReg.totalSupplyOf(commodityId)
    try {
      response = await commodityReg.submitPOW(nonce, commodityId, { from: player1 })
    } catch (e) {
      assert(false, e.toString())
    }
    const totalSupplyAfter = await commodityReg.totalSupplyOf(commodityId)
    const hashFromSolidity = response.logs.find(log => log.event === 'CommodityMined').args._hash

    balance = await commodityReg.balanceOf(player1, commodityId)

    assert.equal(balance.toString(), miningReward.toString(), "did not receive mining reward")
    assert.equal('0x' + hash, hashFromSolidity, "hash from javascript does not match hash from solidity")
    assert.equal(
      totalSupplyBefore.add(miningReward).toString(),
      totalSupplyAfter.toString(),
      "totalSupply did not increase by miningReward amount"
    )
    const commoditiesOwned = (await commodityReg.getCommoditiesOwned(player1)).map(bn => bn.toString())
    assert(commoditiesOwned.includes(commodityId.toString()), "did not add commodityId to list of commoditiesOwned")
  })

  it("does not mint commodity if user submits invalid proof-of-work", async () => {
    const commodityId = 3
    const balanceBefore = await commodityReg.balanceOf(player1, commodityId)

    try {
      await commodityReg.submitPOW(0, 0, { from: player1 })
    } catch (e) {
      // Expecting this to fail so eating error
    }

    const balanceAfter = await commodityReg.balanceOf(player1, commodityId)
    assert.equal(balanceBefore.toString(), balanceAfter.toString(), "received mining reward")
  })

  it.only("only rewards one miner per block", async () => {
    const commodityId = web3.toBigNumber(0)
    let balance1, balance2, nonce1, nonce2, miningData

    try {
      const results = await mine(commodityReg, commodityId, player1)
      nonce1 = results.nonce
      miningData = results.miningData
    } catch (e) {
      assert(false, e.toString())
    }

    try {
      const results = await mine(commodityReg, commodityId, player2)
      nonce2 = results.nonce
      miningData = results.miningData
    } catch (e) {
      assert(false, e.toString())
    }

    const miningReward = miningData[1]

    try {
      commodityReg.submitPOW(nonce1, commodityId, { from: player1 })
      await commodityReg.submitPOW(nonce2, commodityId, { from: player2 })

    } catch (e) {
      assert(false, e.toString())
    }

    [balance1, balance2] = await Promise.all([
      commodityReg.balanceOf(player1, commodityId),
      commodityReg.balanceOf(player2, commodityId),
    ])

    console.log('balance1, balance2', balance1, balance2);

    assert.equal(balance1.toString(), miningReward.toString(), "player1 did not receive mining reward")
    assert.equal(balance2.toString(), "0", "player2 received mining reward")
  })
})
