import { store } from '../redux/store'

export default () => new Promise(async (resolve, reject) => {
  /* 'Refreshes' user data and saves in redux store */
  const state = store.getState()
  const { contracts, user, web3 } = state

  let playerInfo, currentCargo, balance, commoditiesOwned
  try {
    commoditiesOwned = await contracts.commodityReg.getCommoditiesOwned(user.address, { from: user.address })
    balance = await web3.eth.getBalance(user.address)
  } catch (e) {
    return reject(e)
  }

  commoditiesOwned = await Promise.all(commoditiesOwned.map(id => new Promise(async (resolve, reject) => {
    let amount, uri
    try {
      amount = (await contracts.commodityReg.balanceOf(user.address, id.toString()))
      uri = await contracts.commodityReg.getURI(id)
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
      balance: web3.utils.fromWei(balance),
      commoditiesOwned,
    }
  })

  resolve()
})