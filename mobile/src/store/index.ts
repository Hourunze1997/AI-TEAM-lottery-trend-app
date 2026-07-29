import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import { getStorage } from '../utils/secureStore';
import authReducer from './authSlice';
import favoritesReducer from './favoritesSlice';
import notificationsReducer from './notificationsSlice';

const authPersistConfig = {
  key: 'auth',
  storage: getStorage(),
  whitelist: ['token', 'user'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  favorites: favoritesReducer,
  notifications: notificationsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
