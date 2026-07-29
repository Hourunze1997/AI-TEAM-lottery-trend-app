import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FavoriteOut } from '../api/favorites';

export interface FavoritesState {
  items: FavoriteOut[];
}

const initialState: FavoritesState = {
  items: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites(state, action: PayloadAction<FavoriteOut[]>) {
      state.items = action.payload;
    },
    upsertFavorite(state, action: PayloadAction<FavoriteOut>) {
      const idx = state.items.findIndex((f) => f.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
      else state.items.unshift(action.payload);
    },
    removeFavorite(state, action: PayloadAction<number>) {
      state.items = state.items.filter((f) => f.id !== action.payload);
    },
  },
});

export const { setFavorites, upsertFavorite, removeFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
