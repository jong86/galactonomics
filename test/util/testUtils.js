const sha256 = require('js-sha256');

function mineCommodityXTimes(commodityAuthority, numTimes, player, commodityId) {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < numTimes; i++) {
      let nonce
      try {
        const results = await mine(commodityAuthority, commodityId, player)
        nonce = results.nonce
      } catch (e) {
        reject(e)
      }

      try {
        await commodityAuthority.submitPOW(nonce, { from: player })
      } catch (e) {
        reject(e)
      }
    }
    resolve()
  })
}

function mine(commodityAuthority, commodityId, player) {
  return new Promise(async (resolve, reject) => {
    try {
      const miningData = await commodityAuthority.getCommodity(commodityId, { from: player })
      const miningTarget = miningData[2]
      let prevHash = miningData[3]

      if (prevHash.substr(2, 2) === '0x') {
        prevHash = prevHash.substr(2)
      }

      let nonce = web3.toBigNumber(0)
      const one = web3.toBigNumber(1)

      let hash
      do {
        nonce = nonce.add(one)
        hash = sha256(
          nonce.toString() +
          commodityId.toString() +
          prevHash +
          player.substring(2)
        )
      } while (parseInt(hash, 16) >= parseInt(miningTarget, 16))

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