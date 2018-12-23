const CommodityReg = artifacts.require("./CommodityReg.sol")
const CommodityEcon = artifacts.require("./CommodityEcon.sol")
const CommodityInd = artifacts.require("./CommodityInd.sol")
const Crystal = artifacts.require("./items/Crystal.sol")
const CrystalEcon = artifacts.require("./CrystalEcon.sol")
const CrystalForge = artifacts.require("./CrystalForge.sol")
const { mineCommodityXTimes, mine } = require('./util/testUtils')
const truffleAssert = require('truffle-assertions')

contract("CrystalEcon", accounts => {
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

    // Mine some commodities
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

    // Forge some crystals
    const p1CommsOwned = await commodityReg.getCommoditiesOwned(player1)
    await crystalForge.forge([p1CommsOwned[0]], { from: player1 })
    await crystalForge.forge([p1CommsOwned[1]], { from: player1 })
    await crystalForge.forge([p1CommsOwned[2]], { from: player1 })

    const p2CommsOwned = await commodityReg.getCommoditiesOwned(player2)
    await crystalForge.forge([p2CommsOwned[0]], { from: player2 })
    await crystalForge.forge([p2CommsOwned[1]], { from: player2 })
    await crystalForge.forge([p2CommsOwned[2]], { from: player2 })
  })

  it("allows player to list a crystal for sale", async () => {
    await crystalEcon.sell(1, 1000, { from: player1, gas: 6000000 })
    let crystalsForSale = await crystalEcon.getCrystalsForSale()
    crystalsForSale = crystalsForSale.map(crystalIdBN => crystalIdBN.toString())
    assert(crystalsForSale.includes('1'), 'crystal was not made for sale')
  })

  it("stores seller and price of crystal that is for sale", async () => {
    const sellData = await crystalEcon.getCrystalSellData('1')
    assert.equal(sellData[0], player1, 'did not record seller address')
    assert.equal(sellData[1].toNumber(), 1000, 'did not record price')
  })

  it("allows player to purchase a crystal that is for sale", async () => {
    // For balance comparison
    const p1BalanceBefore = await web3.eth.getBalance(player1)
    const p2BalanceBefore = await web3.eth.getBalance(player2)

    // Execute purchase
    const receipt = await crystalEcon.buy(1, { from: player2, value: 1000, gas: 6000000 })
    let ownedCrystals = await crystal.crystalsOfOwner(player2)
    ownedCrystals = ownedCrystals.map(crystalIdBN => crystalIdBN.toString())
    assert(ownedCrystals.includes('1'), 'crystal was not bought')

    // Make sure crystal no longer listed for sale
    let crystalsForSale = await crystalEcon.getCrystalsForSale()
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
})
