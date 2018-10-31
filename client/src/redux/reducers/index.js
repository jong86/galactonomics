import { combineReducers } from 'redux'

import contracts from './contracts';
import view from './view';
import player from './player';

const appReducer = combineReducers({
  contracts,
  view,
  player,
})

export default (state, action) => {
  return appReducer(state, action);
};