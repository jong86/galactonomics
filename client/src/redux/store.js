import { createStore, applyMiddleware } from 'redux';
import reducer from './reducers/index';
import initialState from './initialState'
// import storage from 'redux-persist/lib/storage';
// import { persistStore, persistReducer } from 'redux-persist';

const NODE_ENV = process.env.NODE_ENV || 'development';

// const persistConfig = {
//   key: 'root',
//   storage,
// };

// const persistedReducer = persistReducer(persistConfig, reducer)

let reduxDevTools;
if (NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__) {
  reduxDevTools = window.__REDUX_DEVTOOLS_EXTENSION__()
}

export const store = createStore(
  // Commenting out persistedReducer for dev for now
  // persistedReducer,
  reducer,
  initialState,
  reduxDevTools
)

// export const persistor = persistStore(store)