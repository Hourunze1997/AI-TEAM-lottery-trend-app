import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NotificationSettings } from '../api/notifications';

export interface NotificationsState {
  settings: NotificationSettings | null;
}

const initialState: NotificationsState = {
  settings: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotificationSettings(state, action: PayloadAction<NotificationSettings>) {
      state.settings = action.payload;
    },
  },
});

export const { setNotificationSettings } = notificationsSlice.actions;
export default notificationsSlice.reducer;
