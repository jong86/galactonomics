import { store } from '../redux/store'
import commodities from 'utils/commodities'

export default () => new Promise(async (resolve, reject) => {
  /* 'Refreshes' user data and saves in redux store */
  const state = store.getState()
  const { contracts, user, web3 } = state

  let playerInfo, currentCargo, balance, commoditiesOwned
  try {
    playerInfo = await contracts.gta.getInfo({ from: user.address })
    currentCargo = await contracts.commodities.getCurrentCargo(user.address, { from: user.address })
    commoditiesOwned = await contracts.commodities.getCommoditiesOwned(user.address, { from: user.address })
    balance = await web3.eth.getBalance(user.address)
  } catch (e) {
    return reject(e)
  }

  console.log('commoditiesOwned', commoditiesOwned);

  const cargoPerCommodity = await commoditiesOwned.map(id => new Promise(async (resolve, reject) => {
    let amount
    try {
      amount = (await contracts.commodities.getBalance(id, { from: user.address })).toString()
    } catch (e) {
      return reject(e)
    }
    resolve({ id, amount })
  }))

  store.dispatch({
    type: 'SET_USER_INFO',
    info: {
      currentPlanet: {
        id: playerInfo.currentPlanetId.toString(),
        uri: playerInfo.currentPlanetURI,
      },
      currentFuel: playerInfo.currentFuel.toString(),
      currentCargo: currentCargo,
      maxCargo: playerInfo.maxCargo.toString(),
      maxFuel: playerInfo.maxFuel.toString(),
      spaceshipName: playerInfo.spaceshipName.toString(),
      balance: web3.utils.fromWei(balance),
      cargoPerCommodity: cargoPerCommodity,
    }
  })

  resolve()
})