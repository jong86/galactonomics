const Commodity = artifacts.require("./items/Commodity.sol")
const deployCommodities = require('./utils/deployCommodities')

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
    const address = await commodities[3].geaAddress()
    assert.equal(address, gea, 'did not set')
  })

  it("non-owner cannot set GEA address", async () => {
    try {
      await commodities[3].setGEA(gea, { from: nonOwner })
    } catch (e) {}
    const geaFromContract = await commodities[3].geaAddress()
    assert(geaFromContract !== gea, "could set GEA")
  })

  it("let's owner set GIA address", async () => {
    await commodities[3].setGIA(gia)
    const address = await commodities[3].giaAddress()
    assert.equal(address, gia, 'did not set')
  })

  it("non-owner cannot set GIA address", async () => {
    try {
      await commodities[3].setGIA(gia, { from: nonOwner })
    } catch (e) {}
    const giaFromContract = await commodities[3].giaAddress()
    assert(giaFromContract !== gia, "could set GIA")
  })
})
