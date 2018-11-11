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
})
