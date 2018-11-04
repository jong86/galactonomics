const Web3 = require("web3")
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
const truffleContract = require("truffle-contract")
const giaJSON = require("../build/contracts/GalacticIndustrialAuthority.json")

let investments = []
let gia
const owner = web3.eth.accounts[0]

console.log('owner', owner);

function getContract(json) {
  // Helper for initializing contracts
  const contract = truffleContract(json)
  contract.setProvider(web3.currentProvider)
  return contract.deployed()
}

function initGIA() {
  return new Promise(async (resolve, reject) => {
    gia = await getContract(giaJSON, web3)
    const event = gia.InvestmentMade({ fromBlock: 'latest' })

    event.watch(async (err, res) => {
      if (err) {
        console.log('Watch error', err)
      }
      else {
        console.log('Heard InvestmentMade event')
        // Add investment data to investments array to iterate over
        const { addr, blocksLeft } = res.args
        investments.push({ address: addr, blocksLeft })
      }
    })

    resolve()
  })
}

function pollForNewBlocks() {
  let lastBlock

  setInterval(() => {
    web3.eth.getBlockNumber((error, result) => {
      if (error) return console.error(error)
      if (result !== lastBlock) {
        lastBlock = result
        tellGIAToMint()
      }
    })
  }, 500)
}

function tellGIAToMint() {
  // Send mint commodity tx for every (active) investment once a new block is mined
  investments.forEach(async investment => {
    console.log('investment before', investment);

    try {
      await gia.mintCommodityFor(investment.address, { from: owner })
      console.log("Minted for", investment.address)
    } catch (e) {
      return console.error("Could not mint for", investment.address, e)
    }

    investment.blocksLeft--

    console.log('investment after', investment);
  })

  // Remove investments that have blocksLeft === 0
  investments = investments.filter(investment => investment.blocksLeft > 0)
}

async function main() {
  await initGIA()
  pollForNewBlocks()
}

main()
console.log("Listening for events...")