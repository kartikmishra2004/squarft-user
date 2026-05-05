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
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone, password }),
        }),

    register: (phone, password, first_name, last_name) =>
        request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ phone, password, first_name, last_name }),
        }),

    sendOtp: (phone, purpose) =>
        request('/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ phone, purpose }),
        }),

    verifyOtp: (otp_token, otp) =>
        request('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ otp_token, otp }),
        }),

    resetPassword: (verified_token, new_password) =>
        request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ verified_token, new_password }),
        }),

    googleLogin: (idToken) =>
        request('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ idToken }),
        }),
};
