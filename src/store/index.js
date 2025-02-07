import {configureStore} from '@reduxjs/toolkit';
import {FLUSH, PAUSE, PURGE, PERSIST, REGISTER, REHYDRATE} from 'redux-persist';

import persistedRootReducer from './rootReducer';

const store = configureStore({
  reducer: persistedRootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;
