const sha256 = require('js-sha256');
const { promisify } = require('util')

function mineCommodityXTimes(commodityReg, numTimes, player, commodityId) {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < numTimes; i++) {
      let nonce
      try {
        const results = await mine(commodityReg, commodityId, player)
        nonce = results.nonce
      } catch (e) {
        reject(e)
      }

      try {
        await commodityReg.submitPOW(nonce, commodityId, { from: player })
      } catch (e) {
        reject(e)
      }
    }
    resolve()
  })
}

function mine(commodityReg, commodityId, player) {
  return new Promise(async (resolve, reject) => {
    try {
      const miningData = await commodityReg.getCommodity(commodityId, { from: player })
      const miningTarget = miningData[2]

      let nonce = web3.toBigNumber(0)
      const one = web3.toBigNumber(1)
      const blockNumber = await (promisify(web3.eth.getBlockNumber))()

      let hash
      do {
        nonce = nonce.add(one)
        hash = sha256(
          nonce.toString() +
          commodityId.toString() +
          (blockNumber + 1).toString() +
          player.substring(2)
        )

        hashBN = web3.toBigNumber('0x' + hash)

      } while (hashBN.gt(miningTarget))

      resolve({
        nonce,
        miningData,
        hash,
      })
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  mineCommodityXTimes,
  mine,
}