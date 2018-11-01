import { store } from '../redux/store'

export default () => new Promise(async (resolve, reject) => {
  const state = store.getState()
  console.log('state', state);
  const { contracts, user } = state

  let playerInfo
  try {
    playerInfo = await contracts.gta.getInfo({ from: user.address })
  } catch (e) {
    return reject(e)
  }

  console.log('playerInfo', playerInfo);

  store.dispatch({
    type: 'SET_USER_INFO',
    info: {
      currentFuel: playerInfo.currentFuel.toString(),
      currentPlanet: playerInfo.currentPlanet.toString(),
      maxCargo: playerInfo.maxCargo.toString(),
      maxFuel: playerInfo.maxFuel.toString(),
      spaceshipName: playerInfo.spaceshipName.toString(),
    }
  })

  resolve()
})