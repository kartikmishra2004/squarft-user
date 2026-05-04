import { BASE_URL } from './config';

async function request(path, options = {}) {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Request failed');
        return data;
    } catch (error) {
    
        if (error.message === 'Network request failed') {
            throw new Error('Cannot connect to server. Make sure your phone and computer are on the same Wi-Fi network.');
        }
        throw error;
    }
}

export const authApi = {
    login: (phone, password) =>
        request('/api/auth/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone, password }),
        }),

    register: (phone, password, first_name, last_name) =>
        request('/api/auth/auth/register', {
            method: 'POST',
            body: JSON.stringify({ phone, password, first_name, last_name }),
        }),

    sendOtp: (phone, purpose) =>
        request('/api/auth/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ phone, purpose }),
        }),

    verifyOtp: (otp_token, otp) =>
        request('/api/auth/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ otp_token, otp }),
        }),

    resetPassword: (verified_token, new_password) =>
        request('/api/auth/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ verified_token, new_password }),
        }),

    googleLogin: (idToken) =>
        request('/api/auth/auth/google', {
            method: 'POST',
            body: JSON.stringify({ idToken }),
        }),
};
