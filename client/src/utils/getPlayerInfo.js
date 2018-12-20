import { store } from '../redux/store'

export default () => new Promise(async (resolve, reject) => {
  /* 'Refreshes' user data and saves in redux store */
  const state = store.getState()
  const { contracts, user, web3 } = state

  let playerInfo, currentCargo, balance, commoditiesOwned
  try {
    playerInfo = await contracts.transitAuthority.getInfo({ from: user.address })
    currentCargo = await contracts.commodityAuthority.getCurrentCargo(user.address, { from: user.address })
    commoditiesOwned = await contracts.commodityAuthority.getCommoditiesOwned(user.address, { from: user.address })
    balance = await web3.eth.getBalance(user.address)
  } catch (e) {
    return reject(e)
  }

  commoditiesOwned = await Promise.all(commoditiesOwned.map(id => new Promise(async (resolve, reject) => {
    let amount, uri
    try {
      amount = (await contracts.commodityAuthority.balanceOf(user.address, id.toString()))
      uri = await contracts.commodityAuthority.getURI(id)
    } catch (e) {
      return reject(e)
    }
    resolve({
      id: id.toString(),
      amount: amount.toString(),
      uri,
    })
  })))

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
      commoditiesOwned,
    }
  })

  resolve()
})