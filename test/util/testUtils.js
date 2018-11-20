function fillUpCargoByMinting(gta, gia, player, commodityId) {
  /* Fills cargo up by investments (will stop when another investment would be too much cargo) */
  return new Promise(async resolve => {
    const maxCargo = (await gta.addressToSpaceship(player))[2]
    const amountRequired = await gia.getMiningCost(commodityId)
    try {
      await gia.investInProduction(commodityId, { from: player, value: amountRequired })
    } catch (e) {
      reject("Error invoking investInProduction")
    }

    function doMinting() {
      return new Promise(async resolve => {
        try {
          await gia.mintCommodityFor(player)
        } catch (e) {
          reject("Error invoking mintCommodityFor")
        }

        const blocksLeft = (await gia.getInvestment(player))[1]
        if (blocksLeft > 0) {
          resolve(await doMinting())
        } else {
          resolve()
        }
      })
    }

    await doMinting()

    const currentCargo = await gta.getCurrentCargo(player)
    const totalProductionReturns = await gia.getTotalProductionReturns(commodityId)

    if (maxCargo.sub(currentCargo).cmp(totalProductionReturns) === 1) {
      resolve(await fillUpCargoByMinting(gta, gia, player, commodityId))
    } else {
      resolve()
    }
  })
}

function mintCommodityXTimes(gia, numTimes, player) {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < numTimes; i++) {
      try {
        await gia.mintCommodityFor(player)
      } catch (e) {
        reject(e)
      }
    }
    resolve()
  })
}

module.exports = {
  fillUpCargoByMinting: fillUpCargoByMinting,
  mintCommodityXTimes: mintCommodityXTimes,
}