const CommodityReg = artifacts.require("./CommodityReg.sol")
const TransitAuthority = artifacts.require("./TransitAuthority.sol")
const CommodityEcon = artifacts.require("./CommodityEcon.sol")
const Crystal = artifacts.require("./items/Crystal.sol")
const CrystalReg = artifacts.require("./CrystalReg.sol")
const { fillUpCargoByMining, mineCommodityXTimes, mine } = require('./util/testUtils')

contract("CrystalReg", accounts => {
  let transitAuthority, commodityEcon, commodityReg, crystalReg
  const player1 = accounts[1]
  const player2 = accounts[2]

  before('Deploy contracts and set up', async() => {
    // Deploy main contracts
    transitAuthority = await TransitAuthority.new()
    commodityReg = await CommodityReg.new(transitAuthority.address)
    commodityEcon = await CommodityEcon.new(commodityReg.address, transitAuthority.address)
    crystal = await Crystal.new()
    crystalReg = await CrystalReg.new(commodityReg.address, transitAuthority.address, crystal.address)

    // Set access roles
    await transitAuthority.setCommodityEcon(commodityEcon.address)
    await commodityReg.setCrystalReg(crystalReg.address)

    const costOfSpaceship = await transitAuthority.costOfSpaceship()
    await transitAuthority.buySpaceship("A", { from: player1, value: costOfSpaceship })
    await transitAuthority.buySpaceship("B", { from: player2, value: costOfSpaceship })
    await transitAuthority.travelToPlanet(0, { from: player1 })
    await transitAuthority.travelToPlanet(0, { from: player2 })
  })

  describe('Before players have commodities...', () => {
    it("does not let player forge crystal if player doesn't have enough commodities", async () => {
      await transitAuthority.travelToPlanet(255, { from: player1 })
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
    before('Mint commodities', async () => {
      // Give players enough of each commodity to be able to forge a crystal
      await Promise.all([player1, player2].map(player => new Promise(async (resolve, reject) => {
        try {
          // Move player to each planet so can mine each commodity
          for (let i = 0; i <= 6; i++) {
            await transitAuthority.travelToPlanet(i, { from: player })
            const refuelCost = await transitAuthority.refuelCost()
            await transitAuthority.refuel({ from: player, value: refuelCost })

            const forgingAmount = await crystalReg.forgingAmount()
            let commodityBalance = await commodityReg.balanceOf(player, i, { from: player })

            // Mint commodity until user has enough to forge
            while (commodityBalance.lt(forgingAmount)) {
              const miningReward = await commodityReg.getMiningReward(i)
              const timesToMine = forgingAmount.div(miningReward).toNumber()
              await mineCommodityXTimes(commodityReg, timesToMine, player, i)
              commodityBalance = await commodityReg.balanceOf(player, i, { from: player })
            }

            // Unload unneeded overflow in a sell order, each iteration, to conserve cargo capacity
            if (commodityBalance.gt(forgingAmount)) {
              await commodityEcon.createSellOrder(i, i, commodityBalance.sub(forgingAmount), 100, { from: player })
            }
          }
          resolve()
        } catch (e) {
          reject(e)
        }
      })))
    })

    it("allows player to forge a crystal with one commodity", async () => {
      await transitAuthority.travelToPlanet(255, { from: player1 })
      await crystalReg.forge({ from: player1 })
      const balance = await crystal.balanceOf(player1)
      assert.equal(balance.toString(), '1', 'did not forge a crystal for player1')
    })

    it("allows player to forge a crystal with three commodities", async () => {
      await transitAuthority.travelToPlanet(255, { from: player1 })
      await crystalReg.forge({ from: player1 })
      const balance = await crystal.balanceOf(player1)
      assert.equal(balance.toString(), '1', 'did not forge a crystal for player1')
    })

    it("can return a list of crystal IDs owned by an account", async () => {
      const crystals = await crystalReg.crystalsOfOwner(player1, { gas: 6000000 })
      assert.equal(crystals[0].toString(), '1', 'did not return list')
    })

    it("gives forged crystals a unique URI", async () => {
      await transitAuthority.travelToPlanet(255, { from: player2 })
      await crystalReg.forge({ from: player2 })

      const uri1 = await crystal.tokenURI(1)
      const uri2 = await crystal.tokenURI(2)

      assert(uri1, 'uri1 not defined')
      assert(uri2, 'uri2 not defined')
      assert(uri1 !== uri2, 'URIs were the same')
    })

    it("burns player's commodities after forging", async () => {
      for (let i = 0; i <= 6; i++) {
        const balance = await commodityReg.balanceOf(player1, i, { from: player1 })
        assert.equal(balance.toString(), '0', 'commodities did not get burned')
      }
    })

    it("allows player to list a crystal for sale", async () => {
      await crystalReg.sell(1, 1000, { from: player1, gas: 6000000 })
      let crystalsForSale = await crystalReg.getCrystalsForSale()
      crystalsForSale = crystalsForSale.map(crystalIdBN => crystalIdBN.toString())
      assert(crystalsForSale.includes('1'), 'crystal was not made for sale')
    })

    it("stores seller and price of crystal that is for sale", async () => {
      const sellData = await crystalReg.getCrystalSellData('1')
      assert.equal(sellData[0], player1, 'did not record seller address')
      assert.equal(sellData[1].toNumber(), 1000, 'did not record price')
    })

    it("allows player to purchase a crystal that is for sale", async () => {
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
