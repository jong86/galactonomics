const CommodityInd = artifacts.require("./CommodityInd.sol")
const CommodityReg = artifacts.require("./CommodityReg.sol")
const TestContract = artifacts.require("./TestContract.sol")
const { mine } = require('./util/testUtils')
const truffleAssert = require('truffle-assertions')

contract("CommodityInd", accounts => {
  let commodityInd, commodityReg
  const player1 = accounts[1]
  const commodityId = web3.toBigNumber(123)

  beforeEach(async() => {
    // Deploy contracts
    commodityReg = await CommodityReg.new()
    commodityInd = await CommodityInd.new(commodityReg.address)
    testContract = await TestContract.new(commodityInd.address)

    // Set access controls
    await commodityReg.setCommodityInd(commodityInd.address)
  })

  it("approves of valid proof-of-work", async () => {
    let response, balance, nonce, miningData, hash

    // Find the golden nonce by mining
    try {
      const results = await mine(commodityInd, commodityId, player1)
      nonce = results.nonce
      miningData = results.miningData
      hash = results.hash
    } catch (e) {
      assert(false, e.toString())
    }

    // Submit the nonce as POW
    const miningReward = miningData[0]
    try {
      response = await commodityInd.submitPOW(nonce, commodityId, { from: player1 })
    } catch (e) {
      assert(false, e.toString())
    }

    // Assert balance increase
    balance = await commodityReg.balanceOf(player1, commodityId)
    assert.equal(balance.toString(), miningReward.toString(), "did not receive mining reward")

    // Assert hashes match
    const hashFromSolidity = response.logs.find(log => log.event === 'CommodityMined').args._hash
    assert.equal('0x' + hash, hashFromSolidity, "hash from javascript does not match hash from solidity")
  })

  it("disapproves of invalid proof-of-work", async () => {
    await truffleAssert.reverts(
      commodityInd.submitPOW(5, commodityId, { from: player1 }),
      "That proof-of-work is not valid"
    )
  })

  it("only one mining reward is given per block", async () => {
    let balance, nonce, miningReward

    try {
      const results = await mine(commodityInd, commodityId, testContract.address)
      nonce = results.nonce
      miningReward = results.miningData[0]
    } catch (e) {
      assert(false, e.toString())
    }

    try {
      await testContract.trySubmitPOWTwice(nonce, commodityId)
    } catch (e) {
      assert(false, e.toString())
    }

    balance = await commodityReg.balanceOf(testContract.address, commodityId)

    assert.equal(balance.toString(), miningReward.toString(), "did not work as expected")
  })
})
