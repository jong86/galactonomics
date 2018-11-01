import { store } from '../redux/store'

export default () => new Promise(async (resolve, reject) => {
  const state = store.getState()
  const { contracts, user } = state

  let playerInfo, currentCargo
  try {
    playerInfo = await contracts.gta.getInfo({ from: user.address })
    currentCargo = await contracts.gea.getCurrentCargo(user.address, { from: user.address })
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
    }
  })

  resolve()
})