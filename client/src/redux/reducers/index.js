import { combineReducers } from 'redux'

import web3 from './web3'
import contracts from './contracts'
import view from './view'
import user from './user'
import industrial from './industrial'
import audio from './audio'
import eth from './eth'
import travel from './travel'

const appReducer = combineReducers({
  web3,
  contracts,
  view,
  user,
  industrial,
  audio,
  eth,
  travel,
})

export default (state, action) => appReducer(state, action)