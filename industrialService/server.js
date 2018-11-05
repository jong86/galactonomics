const Web3 = require("web3")
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
const truffleContract = require("truffle-contract")
const giaJSON = require("../build/contracts/GalacticIndustrialAuthority.json")

let investments = []
let gia
const owner = web3.eth.accounts[0]

// To prevent minting from happening twice in a block
let currentlyMinting = false


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

    const evtInvestmentMade = gia.InvestmentMade({ fromBlock: 'latest' })
    evtInvestmentMade.watch(async (err, res) => {
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

    const evtLog = gia.Log({ fromBlock: 'latest' })
    evtLog.watch(async (err, res) => {
      if (err) {
        console.log('Watch error', err)
      }
      else {
        console.log('Heard Log event')
        console.log('res', res);
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
      if (result !== lastBlock && currentlyMinting === false) {
        console.log("\n\n================================");
        console.log("New block seen");
        lastBlock = result

        if (investments.length > 0) {
          console.log('Invoking mintCommodityFor for', investments.length, 'account(s)');
          currentlyMinting = true
          tellGIAToMint()
        } else {
          console.log("No investments, so no minting occured this block.")
        }
      }
    })
  }, 500)
}

async function tellGIAToMint() {
  // Send mint commodity tx for every (active) investment once a new block is mined
  try {
    await Promise.all(investments.map(investment => new Promise(async (resolve, reject) => {
      try {
        await gia.mintCommodityFor(investment.address, { from: owner, gas: "4000000" })
        console.log("Minted for", investment.address)
      } catch (e) {
        return reject(e)
      }

      investment.blocksLeft = investment.blocksLeft.sub(1)
      resolve()
    })))
  } catch (e) {
    console.error(e)
  }

  // Remove investments that have no blocksLeft
  investments = investments.filter(investment => investment.blocksLeft.gt(0))

  // Flag to allow minting to happen again
  currentlyMinting = false
}

async function main() {
  await initGIA()
  pollForNewBlocks()
}

main()
console.log("Listening for events...")