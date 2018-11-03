const Web3 = require("web3")
const truffleContract = require("truffle-contract")
const gtaJSON = require("../build/contracts/GalacticTransitAuthority.json")
const geaJSON = require("../build/contracts/GalacticEconomicAuthority.json")
const giaJSON = require("../build/contracts/GalacticIndustrialAuthority.json")

let investments = []

async function init() {
  web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"))

  let contractsArray = [
    { json: gtaJSON, name: 'gta' },
    { json: geaJSON, name: 'gea' },
    { json: giaJSON, name: 'gia' },
  ]

  const accounts = await web3.eth.getAccounts()
  const owner = accounts[0]
  console.log('owner', owner);

  try {
    contractsArray = await Promise.all(
      contractsArray.map(_contract => new Promise(async (resolve, reject) => {
        const contract = truffleContract(_contract.json)
        contract.setProvider(web3.currentProvider)

        // The next if block is from here:
        // https://github.com/trufflesuite/truffle-contract/issues/57#issuecomment-331300494
        if (typeof contract.currentProvider.sendAsync !== "function") {
          contract.currentProvider.sendAsync = function() {
            return contract.currentProvider.send.apply(
              contract.currentProvider, arguments
            );
          };
        }

        try {
          const instance = await contract.deployed()
          resolve({ instance: instance, name: _contract.name })
        } catch (e) {
          reject(e)
        }
      }))
    )
  } catch (e) {
    console.error(e)
  }

  // Store the contract instances in an object for easy reference
  let contracts = {}
  contractsArray.forEach(contract => contracts[contract.name] = contract.instance)

  let blockNumber
  try {
    blockNumber = await web3.eth.getBlockNumber()
  } catch (e) {
    console.error(e)
  }


  // Set up listening to InvestmentMade event
  contracts.gia.InvestmentMade({ from: blockNumber }, async (error, result) => {
    if (error) return console.error(error)

    console.log("Heard InvestmentMade event:", result)

    // Adds investment info to investments array so we can loop over it
    investments.push({
      address: result.args.addr,
      blocksLeft: result.args.blocksLeft,
    })
  })

  console.log("Listening for InvestmentMade event...")


  web3.eth.subscribe('newBlockHeaders', async () => {
    // Send mint commodity tx for every (active) investment once a new block is mined
    investments.forEach(async (investment) => {
      try {
        await contracts.gia.mintCommodityFor(investment.address, { from: owner })
        console.log("Minted for", investment.address)
      } catch (e) {
        return console.error("Could not mint for", investment.address, e)
      }

      investment.blocksLeft--
    })

    // Remove investments that have blocksLeft === 0
    investments = investments.filter(investment => investment.blocksLeft > 0)
  });

  web3.eth.subscribe('logs', {}, console.log);
}

init()