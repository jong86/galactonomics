import { store } from '../redux/store'

export default () => new Promise(async (resolve, reject) => {
  /* Refreshes accounts commoditiesOwned array and saves in redux store */
  const state = store.getState()
  const { contracts, user } = state

  let commoditiesOwned
  try {
    commoditiesOwned = await contracts.commodityReg.getCommoditiesOwned(user.address, { from: user.address })
  } catch (e) {
    return reject(e)
  }

  commoditiesOwned = await Promise.all(commoditiesOwned.map(id => new Promise(async (resolve, reject) => {
    let amount, uri
    try {
      [amount, uri] = await Promise.all([
        contracts.commodityReg.balanceOf(user.address, id.toString()),
        contracts.commodityReg.getURI(id),
      ])
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
    type: 'SET_COMMODITIES_OWNED',
    commoditiesOwned,
  })

  resolve()
})