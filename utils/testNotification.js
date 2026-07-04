/**
 * Test Notification Utility
 * Use this in development to test notification UI without backend
 * 
 * Usage in any component:
 * import { sendTestNotification } from '../utils/testNotification';
 * sendTestNotification('VISIT_CONFIRMED', dispatch);
 */

import { addNotification } from '../store/slices/notificationSlice';
import { NOTIFICATION_EVENTS } from '../constants/notificationTypes';

const TEST_NOTIFICATIONS = {
  [NOTIFICATION_EVENTS.AUTH_PHONE_UPDATED]: {
    title: 'Mobile Number Updated',
    description: 'Your SquarFT mobile number was updated to ****1234. If this was not you, contact support immediately.',
    eventKey: NOTIFICATION_EVENTS.AUTH_PHONE_UPDATED,
    category: 'profile',
    deepLink: '/profile/security',
    data: {
      user_id: 'test-user-123',
      masked_phone: '****1234',
    },
  },

  [NOTIFICATION_EVENTS.USER_WELCOME]: {
    title: 'Welcome to SquarFT',
    description: 'Your account is ready. Explore verified properties, save favourites, and book a site visit.',
    eventKey: NOTIFICATION_EVENTS.USER_WELCOME,
    category: 'success',
    deepLink: '/home',
    data: {
      user_name: 'Test User',
    },
  },

  [NOTIFICATION_EVENTS.USER_PROFILE_INCOMPLETE]: {
    title: 'Complete Your Profile',
    description: 'Add your preferred location, budget, and property type to receive better verified property matches.',
    eventKey: NOTIFICATION_EVENTS.USER_PROFILE_INCOMPLETE,
    category: 'warning',
    deepLink: '/profile/preferences',
    data: {},
  },

  [NOTIFICATION_EVENTS.USER_PROFILE_COMPLETED]: {
    title: 'Profile Completed',
    description: 'Your property preferences are saved. We will now show you more relevant verified properties.',
    eventKey: NOTIFICATION_EVENTS.USER_PROFILE_COMPLETED,
    category: 'success',
    deepLink: '/profile',
    data: {},
  },

  [NOTIFICATION_EVENTS.USER_LOCATION_UPDATED]: {
    title: 'Preferred Location Updated',
    description: 'Your preferred location is now Bangalore, Karnataka. We will refresh your verified property recommendations.',
    eventKey: NOTIFICATION_EVENTS.USER_LOCATION_UPDATED,
    category: 'info',
    deepLink: '/profile/preferences',
    data: {
      location: 'Bangalore, Karnataka',
    },
  },

  [NOTIFICATION_EVENTS.PROPERTY_MATCH_FOUND]: {
    title: 'New Verified Property Match',
    description: '3 BHK Apartment in Whitefield, Bangalore matches your preferences. View verified details and availability.',
    eventKey: NOTIFICATION_EVENTS.PROPERTY_MATCH_FOUND,
    category: 'property',
    deepLink: '/properties/test-property-123',
    data: {
      property_id: 'test-property-123',
      property_type: '3 BHK Apartment',
      location: 'Whitefield, Bangalore',
    },
  },

  [NOTIFICATION_EVENTS.PROPERTY_SAVED]: {
    title: 'Added to Your Shortlist',
    description: 'Prestige Lakeside Habitat has been added to your shortlist. You can review it anytime from Saved Properties.',
    eventKey: NOTIFICATION_EVENTS.PROPERTY_SAVED,
    category: 'success',
    deepLink: '/shortlist',
    data: {
      property_name: 'Prestige Lakeside Habitat',
      property_id: 'test-property-456',
    },
  },

  [NOTIFICATION_EVENTS.PROPERTY_PRICE_DROPPED]: {
    title: 'Price Reduced on a Saved Property',
    description: 'Prestige Lakeside Habitat is now priced at ₹78 Lac, reduced from ₹85 Lac.',
    eventKey: NOTIFICATION_EVENTS.PROPERTY_PRICE_DROPPED,
    category: 'success',
    deepLink: '/properties/test-property-456',
    data: {
      property_name: 'Prestige Lakeside Habitat',
      property_id: 'test-property-456',
      old_price: '₹85 Lac',
      new_price: '₹78 Lac',
    },
  },

  [NOTIFICATION_EVENTS.PROPERTY_AVAILABILITY_LOW]: {
    title: 'Limited Availability',
    description: 'Only 3 unit(s) remain for Prestige Lakeside Habitat. Review availability before booking your visit.',
    eventKey: NOTIFICATION_EVENTS.PROPERTY_AVAILABILITY_LOW,
    category: 'warning',
    deepLink: '/properties/test-property-456',
    data: {
      property_name: 'Prestige Lakeside Habitat',
      property_id: 'test-property-456',
      available_units: 3,
    },
  },

  [NOTIFICATION_EVENTS.PROPERTY_SOLD_OUT]: {
    title: 'Shortlisted Unit Is No Longer Available',
    description: 'Prestige Lakeside Habitat is currently unavailable. We have selected similar verified options for you.',
    eventKey: NOTIFICATION_EVENTS.PROPERTY_SOLD_OUT,
    category: 'warning',
    deepLink: '/recommendations',
    data: {
      property_name: 'Prestige Lakeside Habitat',
      property_id: 'test-property-456',
    },
  },

  [NOTIFICATION_EVENTS.SAVED_SEARCH_ALERT]: {
    title: 'New Matches for Your Saved Search',
    description: '5 new verified properties match your saved search for "3BHK in Whitefield".',
    eventKey: NOTIFICATION_EVENTS.SAVED_SEARCH_ALERT,
    category: 'property',
    deepLink: '/saved-searches/test-search-123',
    data: {
      search_name: '3BHK in Whitefield',
      search_id: 'test-search-123',
      match_count: 5,
    },
  },

  [NOTIFICATION_EVENTS.SIMILAR_PROPERTY_RECOMMENDATION]: {
    title: 'Similar Verified Properties Available',
    description: 'We found 8 verified alternatives similar to Prestige Lakeside Habitat.',
    eventKey: NOTIFICATION_EVENTS.SIMILAR_PROPERTY_RECOMMENDATION,
    category: 'property',
    deepLink: '/recommendations',
    data: {
      property_name: 'Prestige Lakeside Habitat',
      property_id: 'test-property-456',
      match_count: 8,
    },
  },

  [NOTIFICATION_EVENTS.VISIT_REQUEST_SUBMITTED]: {
    title: 'Your Visit Request Has Been Received',
    description: 'We received your request to visit Prestige Lakeside Habitat. Our team will confirm the slot shortly.',
    eventKey: NOTIFICATION_EVENTS.VISIT_REQUEST_SUBMITTED,
    category: 'info',
    deepLink: '/visits/test-visit-123',
    data: {
      visit_id: 'test-visit-123',
      property_name: 'Prestige Lakeside Habitat',
      property_id: 'test-property-456',
    },
  },

  [NOTIFICATION_EVENTS.VISIT_CONFIRMED]: {
    title: 'Your Site Visit Is Confirmed',
    description: 'Your visit for 2 verified property option(s) is confirmed on May 15, 2026 at 10:00 AM.',
    eventKey: NOTIFICATION_EVENTS.VISIT_CONFIRMED,
    category: 'success',
    deepLink: '/visits/test-visit-123',
    data: {
      visit_id: 'test-visit-123',
      property_id: 'test-property-456',
      visit_date: 'May 15, 2026',
      visit_time: '10:00 AM',
      property_count: 2,
      sales_officer_name: 'Rajesh Kumar',
    },
  },

  [NOTIFICATION_EVENTS.VISIT_REMINDER_24H]: {
    title: 'Site Visit Tomorrow',
    description: 'Reminder: your site visit is tomorrow at 10:00 AM. Review the route and verified property list.',
    eventKey: NOTIFICATION_EVENTS.VISIT_REMINDER_24H,
    category: 'info',
    deepLink: '/visits/test-visit-123',
    data: {
      visit_id: 'test-visit-123',
      visit_date: 'May 15, 2026',
      visit_time: '10:00 AM',
      meeting_point: 'Prestige Lakeside Habitat Sales Office',
    },
  },
};

/**
 * Send test notification
 * @param {string} eventKey - Notification event key from NOTIFICATION_EVENTS
 * @param {function} dispatch - Redux dispatch function
 */
export const sendTestNotification = (eventKey, dispatch) => {
  const testNotification = TEST_NOTIFICATIONS[eventKey];

  if (!testNotification) {
    console.warn('[TestNotification] Unknown event key:', eventKey);
    return;
  }

  console.log('[TestNotification] Sending test notification:', eventKey);

  dispatch(addNotification({
    ...testNotification,
    time: 'Just now',
  }));
};

/**
 * Send all test notifications (for testing UI with multiple notifications)
 * @param {function} dispatch - Redux dispatch function
 */
export const sendAllTestNotifications = (dispatch) => {
  console.log('[TestNotification] Sending all test notifications');

  Object.keys(TEST_NOTIFICATIONS).forEach((eventKey) => {
    setTimeout(() => {
      sendTestNotification(eventKey, dispatch);
    }, Math.random() * 3000); // Stagger notifications
  });
};

/**
 * Get list of available test notifications
 * @returns {Array} Array of event keys
 */
export const getAvailableTestNotifications = () => {
  return Object.keys(TEST_NOTIFICATIONS);
};
