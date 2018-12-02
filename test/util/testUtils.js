const sha256 = require('js-sha256');

function fillUpCargoByMining(commodities, gta, gia, player, commodityId) {
  /* Fills cargo up by investments (will stop when another investment would be too much cargo) */
  return new Promise(async (resolve, reject) => {
    let maxCargo, currentCargo, miningReward

    do {
      try {
        await gia.submitProofOfWork(commodityId, { from: player })
      } catch (e) {
        reject("Error invoking submitProofOfWork")
      }

      maxCargo = (await gta.addressToSpaceship(player))[2]
      currentCargo = await commodities.getCurrentCargo(player)
      miningReward = await commodities.getMiningReward(commodityId)

    } while (maxCargo.sub(currentCargo).gt(miningReward))

    resolve()
  })
}

function mineCommodityXTimes(gia, numTimes, player, commodityId) {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < numTimes; i++) {
      try {
        const miningData = await gia.getMiningData({ from: player })
        const miningTarget = miningData[1]
        const prevHash = miningData[2]

        let nonce = 0
        let hash
        do {
          nonce++
          hash = sha256(
            nonce.toString() +
            commodityId.toString() +
            prevHash +
            player.substring(2)
          )
        } while (parseInt(hash, 16) >= parseInt(miningTarget, 16))

        await gia.submitProofOfWork(String(nonce), { from: player })

      } catch (e) {
        reject(e)
      }
    }
    resolve()
  })
}

module.exports = {
  fillUpCargoByMining: fillUpCargoByMining,
  mineCommodityXTimes: mineCommodityXTimes,
}