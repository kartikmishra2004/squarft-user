import { createSlice } from '@reduxjs/toolkit';
import { initialNotifications } from '../../data/notifications';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: initialNotifications,
  },
  reducers: {
    markAsWatched: (state, action) => {
      const notification = state.list.find(n => n.id === action.payload);
      if (notification) {
        notification.watched = true;
      }
    },
    markAllAsWatched: (state) => {
      state.list.forEach(n => {
        n.watched = true;
      });
    },
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
    }
  },
});

export const { markAsWatched, markAllAsWatched, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
