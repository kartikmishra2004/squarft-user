import { createSlice } from '@reduxjs/toolkit';
import { initialNotifications } from '../../data/notifications';
import { EVENT_CATEGORY_MAP } from '../../constants/notificationTypes';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: initialNotifications,
    unreadCount: 0,
  },
  reducers: {
    markAsWatched: (state, action) => {
      const notification = state.list.find(n => n.id === action.payload);
      if (notification && !notification.watched) {
        notification.watched = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsWatched: (state) => {
      state.list.forEach(n => {
        n.watched = true;
      });
      state.unreadCount = 0;
    },
    addNotification: (state, action) => {
      const notification = {
        id: action.payload.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: action.payload.title || '',
        description: action.payload.description || action.payload.body || '',
        time: action.payload.time || 'Just now',
        watched: false,
        eventKey: action.payload.eventKey || null,
        category: action.payload.category || EVENT_CATEGORY_MAP[action.payload.eventKey] || 'info',
        deepLink: action.payload.deepLink || null,
        data: action.payload.data || {},
        createdAt: action.payload.createdAt || new Date().toISOString(),
      };
      
      state.list.unshift(notification);
      state.unreadCount += 1;
    },
    setNotifications: (state, action) => {
      state.list = action.payload;
      state.unreadCount = action.payload.filter(n => !n.watched).length;
    },
    clearNotifications: (state) => {
      state.list = [];
      state.unreadCount = 0;
    },
  },
});

export const { 
  markAsWatched, 
  markAllAsWatched, 
  addNotification, 
  setNotifications,
  clearNotifications 
} = notificationSlice.actions;

export default notificationSlice.reducer;
