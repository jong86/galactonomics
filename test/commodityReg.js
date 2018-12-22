const CommodityReg = artifacts.require("./CommodityReg.sol")
const TestContract = artifacts.require("./TestContract.sol")
const truffleAssert = require('truffle-assertions')

contract("CommodityReg", accounts => {
  let commodityReg
  const commodityEcon = accounts[1]
  const commodityInd = accounts[2]
  const player1 = accounts[3]
  const player2 = accounts[4]
  const commodityId = web3.toBigNumber(1230)
  const qty = web3.toBigNumber(50000)

  function init() {
    return new Promise(async resolve => {
      // Deploy contracts
      commodityReg = await CommodityReg.new()
      testContract = await TestContract.new(commodityReg.address)

      // Set access controls
      await commodityReg.setCommodityEcon(commodityEcon)
      await commodityReg.setCommodityInd(commodityInd)

      resolve()
    })
  }

  describe("mint function", () => {
    beforeEach(async() => {
      await init()
      await commodityReg.mint(player1, commodityId, qty, { from: commodityInd })
    })

    it("adjusts balances correctly", async () => {
      const balance = await commodityReg.balanceOf(player1, commodityId)
      assert.deepEqual(balance, qty, "did not increase balance")
    })

    it("adjusts total supply correctly", async () => {
      const totalSupply = await commodityReg.totalSupplyOf(commodityId)
      assert.deepEqual(totalSupply, qty, "did not increase totalSupply")
    })

    it("adjusts commoditiesOwned array correctly", async () => {
      const commoditiesOwned = await commodityReg.getCommoditiesOwned(player1)
      assert.deepEqual(commoditiesOwned[0], commodityId, "did not add commodity to commoditiesOwned")
    })

    it("address that is not commodityInd may not call the function", async () => {
      await truffleAssert.reverts(
        commodityReg.mint(player1, commodityId, qty, { from: player1 }),
        "Only CommodityInd may access this function"
      )
    })
  })

  describe("burn function", () => {
    beforeEach(async() => {
      await init()
      await commodityReg.mint(player1, commodityId, qty, { from: commodityInd })
      await commodityReg.mint(player1, commodityId, qty, { from: commodityInd })
      await commodityReg.burn(player1, commodityId, qty, { from: commodityInd })
    })

    it("adjusts balances correctly", async () => {
      const balance = await commodityReg.balanceOf(player1, commodityId)
      assert.deepEqual(balance, qty, "did not decrease balance")
    })

    it("adjusts total supply correctly", async () => {
      const totalSupply = await commodityReg.totalSupplyOf(commodityId)
      assert.deepEqual(totalSupply, qty, "did not decrease totalSupply")
    })

    it("adjusts commoditiesOwned array correctly", async () => {
      // Burn once more so balance should be zero
      await commodityReg.burn(player1, commodityId, qty, { from: commodityInd })

      const commoditiesOwned = await commodityReg.getCommoditiesOwned(player1)
      assert.equal(commoditiesOwned.length, 0, "did not remove commodity to commoditiesOwned")
    })

    it("address that is not commodityInd may not call the function", async () => {
      await truffleAssert.reverts(
        commodityReg.burn(player1, commodityId, qty, { from: player1 }),
        "Only CommodityInd may access this function"
      )
    })
  })

  describe("transferToEscrow function", () => {
    beforeEach(async() => {
      await init()
      await commodityReg.mint(player1, commodityId, qty, { from: commodityInd })
      await commodityReg.transferToEscrow(player1, commodityId, qty, { from: commodityEcon })
    })

    it("adjusts balances correctly", async () => {
      const balanceEscrow = await commodityReg.balanceOf(commodityReg.address, commodityId)
      assert.deepEqual(balanceEscrow, qty, "did not store in escrow")

      const balancePlayer = await commodityReg.balanceOf(player1, commodityId)
      assert.deepEqual(balancePlayer.toString(), "0", "did not subtract player balance")
    })

    it("adjusts commoditiesOwned array correctly", async () => {
      let commsEscrow, commsPlayer

      // Check if escrow's list adjusted
      commsEscrow = await commodityReg.getCommoditiesOwned(commodityReg.address)
      assert.equal(commsEscrow.length, 1, "did not push to escrow commoditiesOwned")
      assert.deepEqual(commsEscrow[0], commodityId, "did not add correct commodityId to escrow commoditiesOwned")

      // Check if player's list adjusted
      commsPlayer = await commodityReg.getCommoditiesOwned(player1)
      assert.equal(commsPlayer.length, 0, "did not remove from player's commoditiesOwned")
    })

    it("address that is not commodityEcon may not call the function", async () => {
      await truffleAssert.reverts(
        commodityReg.transferToEscrow(player1, commodityId, qty, { from: player1 }),
        "Only CommodityEcon may access this function"
      )
    })
  })

  describe("transferFromEscrow function", () => {
    beforeEach(async() => {
      await init()
      await commodityReg.mint(player1, commodityId, qty, { from: commodityInd })
      await commodityReg.transferToEscrow(player1, commodityId, qty, { from: commodityEcon })
      await commodityReg.transferFromEscrow(player2, commodityId, qty, { from: commodityEcon })
    })

    it("adjusts balances correctly", async () => {
      const balanceEscrow = await commodityReg.balanceOf(commodityReg.address, commodityId)
      assert.equal(balanceEscrow.toString(), "0", "did not remove from escrow")

      const balancePlayer = await commodityReg.balanceOf(player2, commodityId)
      assert.deepEqual(balancePlayer, qty, "did not increase player balance")
    })

    it("adjusts commoditiesOwned array correctly", async () => {
      let commsEscrow, commsPlayer

      // Check if players's list adjusted
      commsPlayer = await commodityReg.getCommoditiesOwned(player2)
      assert.equal(commsPlayer.length, 1, "did not push to player's commoditiesOwned")
      assert.deepEqual(commsPlayer[0], commodityId, "did not add correct commodityId to player's commoditiesOwned")

      // Check if escrow's list adjusted
      commsEscrow = await commodityReg.getCommoditiesOwned(commodityReg.address)
      assert.equal(commsEscrow.length, 0, "did not remove from escrow's commoditiesOwned")
    })

    it("address that is not commodityEcon may not call the function", async () => {
      await truffleAssert.reverts(
        commodityReg.transferFromEscrow(player2, commodityId, qty, { from: player2 }),
        "Only CommodityEcon may access this function"
      )
    })
  })
})
