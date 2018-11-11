const deployCommodities = require('../utils/deployCommodities')

contract("Commodity", accounts => {
  let commodities
  const owner = accounts[0]
  const gea = accounts[1]
  const gia = accounts[2]
  const player1 = accounts[3]
  const player2 = accounts[4]
  const nonOwner = accounts[5]

  beforeEach(async() => {
    commodities = await deployCommodities()
  })

  it("let's owner set GEA address", async () => {
    await commodities[3].setGEA(gea)
    const address = await commodities[3].gea()
    assert.equal(address, gea, 'did not set')
  })

  it("non-owner cannot set GEA address", async () => {
    try {
      await commodities[3].setGEA(gea, { from: nonOwner })
    } catch (e) {}
    const geaFromContract = await commodities[3].gea()
    assert(geaFromContract !== gea, "could set GEA")
  })

  it("let's owner set GIA address", async () => {
    await commodities[3].setGIA(gia)
    const address = await commodities[3].gia()
    assert.equal(address, gia, 'did not set')
  })

  it("non-owner cannot set GIA address", async () => {
    try {
      await commodities[3].setGIA(gia, { from: nonOwner })
    } catch (e) {}
    const giaFromContract = await commodities[3].gia()
    assert(giaFromContract !== gia, "could set GIA")
  })

  it("allows GIA to mint tokens to a player", async () => {
    await commodities[3].setGIA(gia)
    await commodities[3].mint(player1, 500, { from: gia })
    const p1Bal = await commodities[3].balanceOf(player1)
    assert.equal(p1Bal.toString(), "500", "Did not mint to player1")
  })

  it("non-GIA cannot mint tokens to a player", async () => {
    await commodities[3].setGIA(gia)
    try {
      await commodities[3].mint(player1, 500, { from: owner })
    } catch (e) {}
    const p1Bal = await commodities[3].balanceOf(player1)
    assert.equal(p1Bal.toString(), "0", "could mint to player1")
  })

  it("allows GEA to transfer tokens on behalf of a player", async () => {
    await commodities[3].setGEA(gea)
    await commodities[3].setGIA(gia)
    await commodities[3].mint(player1, 500, { from: gia })
    await commodities[3].transferForPlayer(player1, player2, 500, { from: gea })
    const p1Bal = await commodities[3].balanceOf(player1)
    assert.equal(p1Bal.toString(), "0", "Did not transfer from player1")
    const p2Bal = await commodities[3].balanceOf(player2)
    assert.equal(p2Bal.toString(), "500", "Did not transfer to player2")
  })

  it("non-GEA cannot transfer tokens on behalf of a player", async () => {
    await commodities[3].setGEA(gea)
    await commodities[3].setGIA(gia)
    await commodities[3].mint(player1, 500, { from: gia })
    try {
      await commodities[3].transferForPlayer(player1, player2, 500, { from: player2 }) // <-- sneaky dude
    } catch (e) {}
    const p1Bal = await commodities[3].balanceOf(player1)
    assert.equal(p1Bal.toString(), "500", "could transfer from player1")
    const p2Bal = await commodities[3].balanceOf(player2)
    assert.equal(p2Bal.toString(), "0", "could transfer to player2")
  })

  it("allows GEA to transfer token to a player", async () => {
    await commodities[3].setGEA(gea)
    await commodities[3].setGIA(gia)
    await commodities[3].mint(gea, 500, { from: gia })
    await commodities[3].transfer(player1, 500, { from: gea })
    const p1Bal = await commodities[3].balanceOf(player1)
    assert.equal(p1Bal.toString(), "500", "Did not transfer to player1")
  })

  it("non-GEA cannot transfer token directly to a player (must be proxied through GEA)", async () => {
    await commodities[3].setGEA(gea)
    await commodities[3].setGIA(gia)
    await commodities[3].mint(player2, 500, { from: gia })
    try {
      await commodities[3].transfer(player1, 500, { from: player2 })
    } catch (e) {}
    const p1Bal = await commodities[3].balanceOf(player1)
    assert.equal(p1Bal.toString(), "0", "could transfer directly")
  })

  it("has four ERC20 standard functions blocked (provisional solution)", async () => {
    let counter = 0
    try {
      await commodities[3].approve(player1, 500, { from: player2 })
    } catch (e) {
      counter++
    }
    try {
      await commodities[3].transferFrom(player1, 500, { from: player2 })
    } catch (e) {
      counter++
    }
    try {
      await commodities[3].increaseAllowance(player1, 500, { from: player2 })
    } catch (e) {
      counter++
    }
    try {
      await commodities[3].decreaseAllowance(player1, 500, { from: player2 })
    } catch (e) {
      counter++
    }
    assert(counter === 4, "4 were not blocked")
  })
})
