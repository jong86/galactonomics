const CommodityReg = artifacts.require("./CommodityReg.sol")
const CommodityEcon = artifacts.require("./CommodityEcon.sol")
const CommodityInd = artifacts.require("./CommodityInd.sol")
const Crystal = artifacts.require("./items/Crystal.sol")
const CrystalEcon = artifacts.require("./CrystalEcon.sol")
const CrystalForge = artifacts.require("./CrystalForge.sol")
const { mineCommodityXTimes, mine } = require('./util/testUtils')
const truffleAssert = require('truffle-assertions')

contract("CrystalForge", accounts => {
  let commodityEcon, commodityInd, commodityReg, crystal, crystalEcon, crystalForge
  const player1 = accounts[1]
  const player2 = accounts[2]

  before('Deploy contracts and set up', async() => {
    // Deploy contracts
    commodityReg = await CommodityReg.new()
    commodityEcon = await CommodityEcon.new(commodityReg.address)
    commodityInd = await CommodityInd.new(commodityReg.address)
    crystal = await Crystal.new()
    crystalEcon = await CrystalEcon.new(commodityReg.address, crystal.address)
    crystalForge = await CrystalForge.new(commodityReg.address, crystal.address)

    // Set access controls
    await commodityReg.setCommodityEcon(commodityEcon.address)
    await commodityReg.setCommodityInd(commodityInd.address)
    await commodityReg.setCrystalForge(crystalForge.address)
    await crystal.setCrystalForge(crystalForge.address)
    await crystal.setCrystalEcon(crystalEcon.address)
  })

  describe('Before players have commodities...', () => {
    it("does not let player forge crystal if player doesn't have any commodities", async () => {
      await truffleAssert.reverts(
        crystalForge.forge([web3.toBigNumber(0)], { from: player1 }),
        "You do not have enough commodities to forge"
      )
    })
  })

  describe('After players have commodities (might take a bit)...', () => {
    before('Mine commodities', async () => {
      // Have players mine a bunch of commodities so we can test crystal forging
      for (player of [player1, player2]) {
        try {
          for (let i = 0; i <= 4; i++) {
            const commodityId = Math.floor(Math.random() * 10000000000)
            const forgingAmount = await crystalForge.forgingAmount()

            let commodityBalance = await commodityReg.balanceOf(player, commodityId)

            // Mint commodity until user has enough to forge
            while (commodityBalance.lt(forgingAmount)) {
              const miningReward = await commodityInd.getMiningReward(commodityId)
              const timesToMine = forgingAmount.div(miningReward).toNumber()
              await mineCommodityXTimes(commodityInd, timesToMine, player, commodityId)
              commodityBalance = await commodityReg.balanceOf(player, commodityId)
            }
          }
        } catch (e) {
          console.error(e)
        }
      }
    })

    it("allows player to forge a crystal with one commodity", async () => {
      const commoditiesOwned = await commodityReg.getCommoditiesOwned(player1)
      const forgingAmount = await crystalForge.forgingAmount()

      // Store variables before forging, for later assertions
      const commBalBefore = await commodityReg.balanceOf(player1, commoditiesOwned[0])
      const commTotalBefore = await commodityReg.totalSupplyOf(commoditiesOwned[0])

      // Perform forging
      await crystalForge.forge([commoditiesOwned[0]], { from: player1 })

      // Store variables post-forging for assertions
      const commBalAfter = await commodityReg.balanceOf(player1, commoditiesOwned[0])
      const commTotalAfter = await commodityReg.totalSupplyOf(commoditiesOwned[0])

      const crystalBal = await crystal.balanceOf(player1)

      assert.equal(crystalBal.toString(), '1', 'did not increase balance of crystals')

      // assert diffs due to commodity burning
      assert.deepEqual(commBalAfter, commBalBefore.sub(forgingAmount), "did not reduce account's commodity balance")
      assert.deepEqual(commTotalAfter, commTotalBefore.sub(forgingAmount), "did not decrease commmodity's total supply")
    })

    it("allows player to forge a crystal with three commodities", async () => {
      const commoditiesOwned = await commodityReg.getCommoditiesOwned(player1)
      const commodities = commoditiesOwned.slice(1, 4)
      const forgingAmount = await crystalForge.forgingAmount()

      // Store variables before forging, for later assertions
      const commsBefore = []
      for (const id of commodities) {
        commsBefore.push({
          balance: await commodityReg.balanceOf(player1, id),
          total: await commodityReg.totalSupplyOf(id),
        })
      }

      // Perform forging
      await crystalForge.forge(
        [commoditiesOwned[1], commoditiesOwned[2], commoditiesOwned[3]],
        { from: player1 }
      )

      // Store variables post-forging for assertions
      const commsAfter = []
      for (const id of commodities) {
        commsAfter.push({
          balance: await commodityReg.balanceOf(player1, id),
          total: await commodityReg.totalSupplyOf(id),
        })
      }

      const crystalBal = await crystal.balanceOf(player1)
      assert.equal(crystalBal.toString(), '2', 'did not forge a crystal for player1')

      // assert diffs due to commodity burning
      for (const [i, commBefore] of commsBefore.entries()) {
        const commAfter = commsAfter[i]
        assert.deepEqual(commAfter.balance, commBefore.balance.sub(forgingAmount), `did not reduce account's commodity${i} balance`)
        assert.deepEqual(commAfter.total, commBefore.total.sub(forgingAmount), `did not reduce commodity${i}'s total supply`)
      }
    })
  })
})
