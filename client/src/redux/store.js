import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import hardSet from 'redux-persist/lib/stateReconciler/hardSet'

import rootReducer from './reducers/index';
import initialState from './initialState'

const NODE_ENV = process.env.NODE_ENV || 'development';

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: hardSet,
};

const persistedReducer = persistReducer(persistConfig, rootReducer)

let reduxDevTools;
if (NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__) {
  reduxDevTools = window.__REDUX_DEVTOOLS_EXTENSION__()
}


// Named exports:

export const store = createStore(
  persistedReducer,
  initialState,
  reduxDevTools,
)

export const persistor = persistStore(store)