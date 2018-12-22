const CommodityReg = artifacts.require("./CommodityReg.sol")
const CommodityEcon = artifacts.require("./CommodityEcon.sol")
const Crystal = artifacts.require("./items/Crystal.sol")
const CrystalReg = artifacts.require("./CrystalReg.sol")
const { mineCommodityXTimes, mine } = require('./util/testUtils')

contract("CrystalReg", accounts => {
  let commodityEcon, commodityReg, crystalReg
  const player1 = accounts[1]
  const player2 = accounts[2]

  before('Deploy contracts and set up', async() => {
    // Deploy contracts
    commodityReg = await CommodityReg.new()
    commodityEcon = await CommodityEcon.new(commodityReg.address)
    commodityInd = await CommodityInd.new(commodityReg.address)

    // Set access controls
    await commodityReg.setCommodityEcon(commodityEcon.address)
    await commodityReg.setCommodityInd(commodityInd.address)
  })

  describe('Before players have commodities...', () => {
    it("does not let player forge crystal if player doesn't have any commodities", async () => {
      try {
        await crystalReg.forge({ from: player1 })
      } catch (e) {}

      let balance
      try {
        balance = await crystal.balanceOf(player1)
      } catch (e) {}
      assert.equal(balance.toString(), '0', 'player could forge')
    })
  })

  describe('After players have commodities...', () => {
    before('Mine commodities', async () => {
      // Have players mine a bunch of commodities so we can test crystal forging
      for (player of [player1, player2]) {
        console.log("Mining commodities...")
        try {
          for (let i = 0; i <= 4; i++) {
            const commodityId = Math.floor(Math.random() * 10000000000)
            const forgingAmount = await crystalReg.forgingAmount()

            let commodityBalance = await commodityReg.balanceOf(player, commodityId)

            // Mint commodity until user has enough to forge
            while (commodityBalance.lt(forgingAmount)) {
              const miningReward = await commodityReg.getMiningReward(commodityId)
              const timesToMine = forgingAmount.div(miningReward).toNumber()
              await mineCommodityXTimes(commodityReg, timesToMine, player, commodityId)
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
      const forgingAmount = await crystalReg.forgingAmount()

      // Store variables before forging, for later assertions
      const commBalBefore = await commodityReg.balanceOf(player1, commoditiesOwned[0])
      const commTotalBefore = await commodityReg.totalSupplyOf(commoditiesOwned[0])

      // Perform forging
      await crystalReg.forge([commoditiesOwned[0]], { from: player1 })

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
      const forgingAmount = await crystalReg.forgingAmount()

      // Store variables before forging, for later assertions
      const commsBefore = []
      for (const id of commodities) {
        commsBefore.push({
          balance: await commodityReg.balanceOf(player1, id),
          total: await commodityReg.totalSupplyOf(id),
        })
      }

      // Perform forging
      await crystalReg.forge(
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

    it("can return a list of crystal IDs owned by an account", async () => {
      const crystals = await crystalReg.crystalsOfOwner(player1)
      const c1 = web3.toBigNumber(1)
      const c2 = web3.toBigNumber(2)
      assert.deepEqual(crystals, [c1, c2], 'did not return list')
    })

    it("crystals have a unique URI", async () => {
      const crystals = await crystalReg.crystalsOfOwner(player1)

      const uri1 = await crystal.tokenURI(crystals[0])
      const uri2 = await crystal.tokenURI(crystals[1])

      assert(uri1, 'uri1 not defined')
      assert(uri2, 'uri2 not defined')
      assert(uri1 !== uri2, 'URIs were the same')
    })

    it.skip("allows player to list a crystal for sale", async () => {
      await crystalReg.sell(1, 1000, { from: player1, gas: 6000000 })
      let crystalsForSale = await crystalReg.getCrystalsForSale()
      crystalsForSale = crystalsForSale.map(crystalIdBN => crystalIdBN.toString())
      assert(crystalsForSale.includes('1'), 'crystal was not made for sale')
    })

    it.skip("stores seller and price of crystal that is for sale", async () => {
      const sellData = await crystalReg.getCrystalSellData('1')
      assert.equal(sellData[0], player1, 'did not record seller address')
      assert.equal(sellData[1].toNumber(), 1000, 'did not record price')
    })

    it.skip("allows player to purchase a crystal that is for sale", async () => {
      // For balance comparison
      const p1BalanceBefore = await web3.eth.getBalance(player1)
      const p2BalanceBefore = await web3.eth.getBalance(player2)

      // Execute purchase
      const receipt = await crystalReg.buy(1, { from: player2, value: 1000, gas: 6000000 })
      let ownedCrystals = await crystalReg.crystalsOfOwner(player2)
      ownedCrystals = ownedCrystals.map(crystalIdBN => crystalIdBN.toString())
      assert(ownedCrystals.includes('1'), 'crystal was not bought')

      // Make sure crystal no longer listed for sale
      let crystalsForSale = await crystalReg.getCrystalsForSale()
      crystalsForSale = crystalsForSale.map(crystalIdBN => crystalIdBN.toString())
      assert(!crystalsForSale.includes('1'), 'crystal still listed for sale')

      // For balance comparison
      const p1BalanceAfter = await web3.eth.getBalance(player1)
      const p2BalanceAfter = await web3.eth.getBalance(player2)

      const gasPrice = (await web3.eth.getTransaction(receipt.tx)).gasPrice
      const p2TotalFee = web3.toBigNumber(gasPrice).mul(receipt.receipt.gasUsed)

      assert.equal(web3.eth.getBalance(player1).toString(), p1BalanceBefore.add(1000).toString(), 'seller did not receive ether from sale')
      assert.equal(web3.eth.getBalance(player2).toString(), p2BalanceBefore.sub(1000).sub(p2TotalFee).toString(), 'buyer did not have ether withdrawn from account')
    })

    // it("Player can cancel sale of a crystal", async () => {

    // })


  })
})
