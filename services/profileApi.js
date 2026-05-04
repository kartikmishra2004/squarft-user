import { BASE_URL } from './config';

export const profileApi = {
  getUserProfile: async (token) => {
    try {
      console.log('👤 Fetching user profile...');
      
      const response = await fetch(`${BASE_URL}/api/v1/profile/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Profile API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Profile API Error:', errorText);
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Profile data received');
      
      return data.data;
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      throw error;
    }
  },

  updatePhoneNumber: async (token, verifiedToken, newPhone) => {
    try {
      console.log('📱 Updating phone number...');
      
      const response = await fetch(`${BASE_URL}/api/v1/profile/update-phone`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          verified_token: verifiedToken,
          new_phone: newPhone 
        }),
      });

      console.log('📡 Update Phone API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Update Phone API Error:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Failed to update phone number');
        } catch (e) {
          throw new Error('Failed to update phone number');
        }
      }

      const data = await response.json();
      console.log('✅ Phone number updated successfully');
      
      return data;
    } catch (error) {
      console.error('❌ Error updating phone number:', error);
      throw error;
    }
  },
};
