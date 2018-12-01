const HDWalletProvider = require("truffle-hdwallet-provider")
const testMnenomic = "obscure enhance year topic heart flavor quick damage bundle east eager select"

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "5777",
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(testMnenomic, "https://ropsten.infura.io/v3/e3023fedad31499e899cec7b841ea70b")
      },
      network_id: "3",
      gasPrice: 460000000, // 2 GWei
    },
  },
};
