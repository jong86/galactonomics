const Web3 = require("web3")
const truffleContract = require("truffle-contract")
const gtaJSON = require("../build/contracts/GalacticTransitAuthority.json")
const geaJSON = require("../build/contracts/GalacticEconomicAuthority.json")
const giaJSON = require("../build/contracts/GalacticIndustrialAuthority.json")

async function init() {
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"))

  let contractsArray = [
    { json: gtaJSON, name: 'gta' },
    { json: geaJSON, name: 'gea' },
    { json: giaJSON, name: 'gia' },
  ]

  const accounts = await web3.eth.getAccounts()
  const owner = accounts[0]

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

  const blockNumber = await web3.eth.getBlockNumber()


  // Set up listening to InvestmentMade event
  contracts.gia.InvestmentMade({ from: blockNumber }, (error, result) => {
    if (error) return console.error(error)
    console.log('Received investment:', result.args);

    const { commodityId, from: receiver } = result.args

    contracts.gia.mintCommodityFor(commodityId, receiver, { from: owner })
    .on('transactionHash', () => {
      console.log("mintCommodityFor tx sent for", receiver)
    })
    .on('receipt', receipt => {
      console.log("mintCommodityFor tx mined for", receiver)
    })
    .on('error', console.log)
  })

  console.log("Listening for InvestmentMade event...")
}

init()