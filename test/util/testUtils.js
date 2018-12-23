const sha256 = require('js-sha256');

function mineCommodityXTimes(commodityInd, numTimes, player, commodityId) {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < numTimes; i++) {
      let nonce
      try {
        const results = await mine(commodityInd, commodityId, player)
        nonce = results.nonce
      } catch (e) {
        reject(e)
      }

      try {
        await commodityInd.submitPOW(nonce, commodityId, { from: player })
      } catch (e) {
        reject(e)
      }
    }
    resolve()
  })
}

function mine(commodityInd, commodityId, player) {
  return new Promise(async (resolve, reject) => {
    try {
      const miningData = await commodityInd.getMiningData(commodityId, { from: player })
      const miningTarget = miningData[1]

      let nonce = web3.toBigNumber(0)
      const one = web3.toBigNumber(1)

      let hash
      do {
        nonce = nonce.add(one)
        hash = sha256(
          nonce.toString() +
          commodityId.toString() +
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