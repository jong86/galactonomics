const Web3 = require("web3")
const truffleContract = require("truffle-contract")
const gtaJSON = require("../build/contracts/GalacticTransitAuthority.json")
const geaJSON = require("../build/contracts/GalacticEconomicAuthority.json")
const giaJSON = require("../build/contracts/GalacticIndustrialAuthority.json")

async function init() {
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"))

  let contracts = [
    { json: gtaJSON, name: 'gta' },
    { json: geaJSON, name: 'gea' },
    { json: giaJSON, name: 'gia' },
  ]

  try {
    contracts = await Promise.all(
      contracts.map(_contract => new Promise(async (resolve, reject) => {
        const contract = truffleContract(_contract.json)
        contract.setProvider(web3.currentProvider)

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

  const x = await contracts[1].instance.getCommodity(1)
  console.log('x', x);
}

init()