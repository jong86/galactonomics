import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { Provider } from "react-redux";
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react'
import Loader from 'components/reusables/Loader'

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={<Loader />} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
