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

function mineCommodityXTimes(gia, numTimes, player) {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < numTimes; i++) {
      try {
        await gia.submitProofOfWork(0, { from: player })
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