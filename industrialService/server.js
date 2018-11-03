const Web3 = require("web3")
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
const truffleContract = require("truffle-contract")
const giaJSON = require("../build/contracts/GalacticIndustrialAuthority.json")

let investments = []
let gia

function getContract(json) {
  // Helper for initializing contracts
  const contract = truffleContract(json)
  contract.setProvider(web3.currentProvider)
  return contract.deployed()
}

function initGIA() {
  return new Promise(async (resolve, reject) => {
    gia = await getContract(giaJSON, web3)
    const event = gia.InvestmentMade()
    event.watch(async (err, res) => {
      if (err) {
        console.log('watch error', err)
      }
      else {
        console.log('got an event', res)
      }
    })

    resolve()
  })
}

async function main() {
  await initGIA()




  /* Commented out this logic until I get the event listening working: */

  // let blockNumber
  // try {
  //   blockNumber = await web3.eth.getBlockNumber()
  // } catch (e) {
  //   console.error(e)
  // }

  //   // Adds investment info to investments array so we can loop over it
  //   investments.push({
  //     address: result.args.addr,
  //     blocksLeft: result.args.blocksLeft,
  //   })

  // web3.eth.subscribe('newBlockHeaders', async (a, b) => {
  //   // console.log("New block headers seen:", a, b)

  //   // Send mint commodity tx for every (active) investment once a new block is mined
  //   investments.forEach(async (investment) => {
  //     try {
  //       await gia.mintCommodityFor(investment.address, { from: owner })
  //       console.log("Minted for", investment.address)
  //     } catch (e) {
  //       return console.error("Could not mint for", investment.address, e)
  //     }

  //     investment.blocksLeft--
  //   })

  //   // Remove investments that have blocksLeft === 0
  //   investments = investments.filter(investment => investment.blocksLeft > 0)
  // });
}

main()