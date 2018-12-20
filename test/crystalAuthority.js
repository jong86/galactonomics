const CommodityAuthority = artifacts.require("./CommodityAuthority.sol")
const TransitAuthority = artifacts.require("./TransitAuthority.sol")
const EconomicAuthority = artifacts.require("./EconomicAuthority.sol")
const Crystal = artifacts.require("./items/Crystal.sol")
const CrystalAuthority = artifacts.require("./CrystalAuthority.sol")
const { fillUpCargoByMining, mineCommodityXTimes, mine } = require('./util/testUtils')

contract("CrystalAuthority", accounts => {
  let transitAuthority, economicAuthority, commodityAuthority, crystalAuthority
  const player1 = accounts[1]
  const player2 = accounts[2]

  before('Deploy contracts and set up', async() => {
    // Deploy main contracts
    transitAuthority = await TransitAuthority.new()
    commodityAuthority = await CommodityAuthority.new(transitAuthority.address)
    economicAuthority = await EconomicAuthority.new(commodityAuthority.address, transitAuthority.address)
    crystal = await Crystal.new()
    crystalAuthority = await CrystalAuthority.new(commodityAuthority.address, transitAuthority.address, crystal.address)

    // Set access roles
    await transitAuthority.setEconomicAuthority(economicAuthority.address)
    await commodityAuthority.setCrystalAuthority(crystalAuthority.address)

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
        await crystalAuthority.forge({ from: player1 })
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

            const forgingAmount = await crystalAuthority.forgingAmount()
            let commodityBalance = await commodityAuthority.balanceOf(player, i, { from: player })

            // Mint commodity until user has enough to forge
            while (commodityBalance.lt(forgingAmount)) {
              const miningReward = await commodityAuthority.getMiningReward(i)
              const timesToMine = forgingAmount.div(miningReward).toNumber()
              await mineCommodityXTimes(commodityAuthority, timesToMine, player, i)
              commodityBalance = await commodityAuthority.balanceOf(player, i, { from: player })
            }

            // Unload unneeded overflow in a sell order, each iteration, to conserve cargo capacity
            if (commodityBalance.gt(forgingAmount)) {
              await economicAuthority.createSellOrder(i, i, commodityBalance.sub(forgingAmount), 100, { from: player })
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
      await crystalAuthority.forge({ from: player1 })
      const balance = await crystal.balanceOf(player1)
      assert.equal(balance.toString(), '1', 'did not forge a crystal for player1')
    })

    it("allows player to forge a crystal with three commodities", async () => {
      await transitAuthority.travelToPlanet(255, { from: player1 })
      await crystalAuthority.forge({ from: player1 })
      const balance = await crystal.balanceOf(player1)
      assert.equal(balance.toString(), '1', 'did not forge a crystal for player1')
    })

    it("can return a list of crystal IDs owned by an account", async () => {
      const crystals = await crystalAuthority.crystalsOfOwner(player1, { gas: 6000000 })
      assert.equal(crystals[0].toString(), '1', 'did not return list')
    })

    it("gives forged crystals a unique URI", async () => {
      await transitAuthority.travelToPlanet(255, { from: player2 })
      await crystalAuthority.forge({ from: player2 })

      const uri1 = await crystal.tokenURI(1)
      const uri2 = await crystal.tokenURI(2)

      assert(uri1, 'uri1 not defined')
      assert(uri2, 'uri2 not defined')
      assert(uri1 !== uri2, 'URIs were the same')
    })

    it("burns player's commodities after forging", async () => {
      for (let i = 0; i <= 6; i++) {
        const balance = await commodityAuthority.balanceOf(player1, i, { from: player1 })
        assert.equal(balance.toString(), '0', 'commodities did not get burned')
      }
    })

    it("allows player to list a crystal for sale", async () => {
      await crystalAuthority.sell(1, 1000, { from: player1, gas: 6000000 })
      let crystalsForSale = await crystalAuthority.getCrystalsForSale()
      crystalsForSale = crystalsForSale.map(crystalIdBN => crystalIdBN.toString())
      assert(crystalsForSale.includes('1'), 'crystal was not made for sale')
    })

    it("stores seller and price of crystal that is for sale", async () => {
      const sellData = await crystalAuthority.getCrystalSellData('1')
      assert.equal(sellData[0], player1, 'did not record seller address')
      assert.equal(sellData[1].toNumber(), 1000, 'did not record price')
    })

    it("allows player to purchase a crystal that is for sale", async () => {
      // For balance comparison
      const p1BalanceBefore = await web3.eth.getBalance(player1)
      const p2BalanceBefore = await web3.eth.getBalance(player2)

      // Execute purchase
      const receipt = await crystalAuthority.buy(1, { from: player2, value: 1000, gas: 6000000 })
      let ownedCrystals = await crystalAuthority.crystalsOfOwner(player2)
      ownedCrystals = ownedCrystals.map(crystalIdBN => crystalIdBN.toString())
      assert(ownedCrystals.includes('1'), 'crystal was not bought')

      // Make sure crystal no longer listed for sale
      let crystalsForSale = await crystalAuthority.getCrystalsForSale()
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
