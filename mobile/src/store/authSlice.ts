import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: number;
  username?: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<{ token: string; user?: AuthUser }>) {
      state.token = action.payload.token;
      if (action.payload.user) state.user = action.payload.user;
    },
    clearToken(state) {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
