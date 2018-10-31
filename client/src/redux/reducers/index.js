import { combineReducers } from 'redux'

import web3 from './web3'
import contracts from './contracts'
import view from './view'
import player from './player'

const appReducer = combineReducers({
  web3,
  contracts,
  view,
  player,
})

export default (state, action) => appReducer(state, action)