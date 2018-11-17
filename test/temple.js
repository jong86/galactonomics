const GalacticTransitAuthority = artifacts.require("./GalacticTransitAuthority.sol")
const GalacticEconomicAuthority = artifacts.require("./GalacticEconomicAuthority.sol")
const GalacticIndustrialAuthority = artifacts.require("./GalacticIndustrialAuthority.sol")
const ByzantianCrystal = artifacts.require("./items/ByzantianCrystal.sol")
const TempleAuthority = artifacts.require("./TempleAuthority.sol")
const { fillUpCargoByMinting, mintCommodityXTimes } = require('./util/testUtils')
const deployCommodities = require('../utils/deployCommodities')

contract("TempleAuthority", accounts => {
  let gta, gea, gia, commodities, bCrystal, temple
  const owner = accounts[0]
  const player1 = accounts[1]
  const player2 = accounts[2]

  before('Deploy contracts and set up', async() => {
    commodities = await deployCommodities()
    const commodityAddresses = commodities.map(commodity => commodity.address)
    gta = await GalacticTransitAuthority.new()
    gea = await GalacticEconomicAuthority.new(commodityAddresses, gta.address)
    gia = await GalacticIndustrialAuthority.new(commodityAddresses, gta.address)
    bCrystal = await ByzantianCrystal.new()
    temple = await TempleAuthority.new(commodityAddresses, gta.address, bCrystal.address)
    await bCrystal.setTA(temple.address)
    commodities.forEach(async commodity => await commodity.setGEA(gea.address))
    commodities.forEach(async commodity => await commodity.setGIA(gia.address))
    commodities.forEach(async commodity => await commodity.setTA(temple.address))
    const costOfSpaceship = await gta.costOfSpaceship()
    await gta.buySpaceship("A", { from: player1, value: costOfSpaceship })
    await gta.buySpaceship("B", { from: player2, value: costOfSpaceship })
    await gta.travelToPlanet(0, { from: player1 })
    await gta.travelToPlanet(0, { from: player2 })
  })

  describe('Before players have commodities...', () => {
    it("does not let player forge crystal if player doesn't have enough commodities", async () => {
      await gta.travelToPlanet(255, { from: player1 })
      try {
        await temple.forge({ from: player1 })
      } catch (e) {}

      let balance
      try {
        balance = await bCrystal.balanceOf(player1)
      } catch (e) {}
      assert.equal(balance.toString(), '0', 'player could forge')
    })
  })

  describe('After players have commodities...', () => {
    before('Mint commodities', async () => {
      // Give players enough of each commodity to be able to forge a crystal
      console.log('Minting commodities for 2 players, this may take a while...')
      await Promise.all([player1, player2].map(player => new Promise(async (resolve, reject) => {
        try {
          // Move player to each planet so can mine each commodity
          for (let i = 0; i <= 6; i++) {
            await gta.travelToPlanet(i, { from: player })
            const refuelCost = await gta.refuelCost()
            await gta.refuel({ from: player, value: refuelCost })

            const forgingAmount = await temple.forgingAmount()
            let commodityBalance = await gea.getCommodityBalance(i, { from: player })

            // Mint commodity until user has enough to forge
            while (commodityBalance.lt(forgingAmount)) {
              const commodity = await gea.getCommodity(i)
              const miningCost = commodity[3]
              const miningDuration = commodity[5]
              await gia.investInProduction(i, { from: player, value: miningCost })
              await mintCommodityXTimes(gia, miningDuration.toNumber(), player)
              commodityBalance = await gea.getCommodityBalance(i, { from: player })
            }

            // Unload unneeded overflow in a sell order, each iteration, to conserve cargo capacity
            if (commodityBalance.gt(forgingAmount)) {
              await gea.createSellOrder(i, i, commodityBalance.sub(forgingAmount), 100, { from: player })
            }
          }
          resolve()
        } catch (e) {
          reject(e)
        }
      })))
    })

    it("allows player to forge a crystal", async () => {
      await gta.travelToPlanet(255, { from: player1 })
      await temple.forge({ from: player1 })
      const balance = await bCrystal.balanceOf(player1)
      assert.equal(balance.toString(), '1', 'did not forge a b. crystal for player1')
    })

    it("can return a list of crystal IDs owned by an account", async () => {
      const crystals = await temple.crystalsOfOwner(player1, { gas: 6000000 })
      assert.equal(crystals[0].toString(), '1', 'did not return list')
    })

    it("gives forged crystals a unique URI", async () => {
      await gta.travelToPlanet(255, { from: player2 })
      await temple.forge({ from: player2 })

      const uri1 = await bCrystal.tokenURI(1)
      const uri2 = await bCrystal.tokenURI(2)

      assert(uri1, 'uri1 not defined')
      assert(uri2, 'uri2 not defined')
      assert(uri1 !== uri2, 'URIs were the same')
    })

    it("burns player's commodities after forging", async () => {
      for (let i = 0; i <= 6; i++) {
        const balance = await gea.getCommodityBalance(i, { from: player1 })
        assert.equal(balance.toString(), '0', 'commodities did not get burned')
      }
    })

    it("allows player to list a crystal for sale", async () => {
      await temple.sell(1, 1000, { from: player1, gas: 6000000 })
      let crystalsForSale = await temple.getCrystalsForSale()
      crystalsForSale = crystalsForSale.map(crystalIdBN => crystalIdBN.toString())
      assert(crystalsForSale.includes('1'), 'crystal was not made for sale')
    })

    it("stores seller and price of crystal that is for sale", async () => {
      const sellData = await temple.getCrystalSellData('1')
      console.log('sellData', sellData);
      assert.equal(sellData[0], player1, 'did not record seller address')
      assert.equal(sellData[1].toNumber(), 1000, 'did not record price')
    })

    it("allows player to purchase a crystal that is for sale", async () => {
      // For balance comparison
      const p1BalanceBefore = await web3.eth.getBalance(player1)
      const p2BalanceBefore = await web3.eth.getBalance(player2)

      // Execute purchase
      const receipt = await temple.buy(1, { from: player2, value: 1000, gas: 6000000 })
      let ownedCrystals = await temple.crystalsOfOwner(player2)
      ownedCrystals = ownedCrystals.map(crystalIdBN => crystalIdBN.toString())
      assert(ownedCrystals.includes('1'), 'crystal was not bought')

      // Make sure crystal no longer listed for sale
      let crystalsForSale = await temple.getCrystalsForSale()
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
