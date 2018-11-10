import { store } from '../redux/store'

export default () => new Promise(async (resolve, reject) => {
  /* 'Refreshes' user data and saves in redux store */
  const state = store.getState()
  const { contracts, user, web3 } = state

  let playerInfo, currentCargo, balance
  try {
    playerInfo = await contracts.gta.getInfo({ from: user.address })
    currentCargo = await contracts.gea.getCurrentCargo(user.address, { from: user.address })
    balance = await web3.eth.getBalance(user.address)
  } catch (e) {
    return reject(e)
  }

  store.dispatch({
    type: 'SET_USER_INFO',
    info: {
      currentFuel: playerInfo.currentFuel.toString(),
      currentPlanet: playerInfo.currentPlanet.toString(),
      currentCargo: currentCargo,
      maxCargo: playerInfo.maxCargo.toString(),
      maxFuel: playerInfo.maxFuel.toString(),
      spaceshipName: playerInfo.spaceshipName.toString(),
      balance: web3.utils.fromWei(balance),
    }
  })

  resolve()
})