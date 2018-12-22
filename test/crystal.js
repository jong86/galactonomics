const Crystal = artifacts.require("./Crystal.sol")

contract("Crystal", accounts => {
  let crystal
  const crystalForge = accounts[1]
  const crystalEcon = accounts[2]
  const player1 = accounts[3]
  const player2 = accounts[4]

  before('Deploy contract and set up', async() => {
    // Deploy contract
    crystal = await Crystal.new()

    // // Set access controls
    await crystal.setCrystalForge(crystalForge)
    await crystal.setCrystalEcon(crystalEcon)

    // // Create crystals for the players
    await crystal.create(player1, { from: crystalForge })
    await crystal.create(player2, { from: crystalForge })
    await crystal.create(player2, { from: crystalForge })
    await crystal.create(player2, { from: crystalForge })
  })

  it("can return a list of crystal IDs owned by an account", async () => {
    let crystals

    crystals = await crystal.crystalsOfOwner(player1)
    const c1 = web3.toBigNumber(1)
    assert.deepEqual(crystals, [c1], 'did not return list')

    crystals = await crystal.crystalsOfOwner(player2)
    const c2 = web3.toBigNumber(2)
    const c3 = web3.toBigNumber(3)
    const c4 = web3.toBigNumber(4)
    assert.deepEqual(crystals, [c2, c3, c4], 'did not return correct list')
  })

  it("crystals have a unique URI", async () => {
    const crystals = await crystal.crystalsOfOwner(player2)

    const uri1 = await crystal.tokenURI(crystals[0])
    const uri2 = await crystal.tokenURI(crystals[1])

    assert(uri1, 'uri1 not defined')
    assert(uri2, 'uri2 not defined')
    assert(uri1 !== uri2, 'URIs were the same')
  })
})
