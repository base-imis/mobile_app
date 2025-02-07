import {persistReducer} from 'redux-persist';
import {combineReducers} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import mapReducer from './slices/map.slice';
import authReducer from './slices/auth.slice';

const rootPersistConfig = {
  version: 1,
  key: 'root',
  storage: AsyncStorage,
};

const reducers = combineReducers({
  auth: authReducer,
  map: mapReducer,
});

const rootReducer = persistReducer(rootPersistConfig, reducers);

export default rootReducer;
