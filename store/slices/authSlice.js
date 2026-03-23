import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        name: '',
        mobile: '',
        password: '',
        newPassword: '',
        confirmPassword: '',
        otp: ['', '', '', ''],
        otpFlow: 'register', 
        rememberMe: false,
        isLoggedIn: false,
    },
    reducers: {
        setName: (state, action) => { state.name = action.payload; },
        setMobile: (state, action) => { state.mobile = action.payload; },
        setPassword: (state, action) => { state.password = action.payload; },
        setNewPassword: (state, action) => { state.newPassword = action.payload; },
        setConfirmPassword: (state, action) => { state.confirmPassword = action.payload; },
        setOtpDigit: (state, action) => {
            const { index, value } = action.payload;
            state.otp[index] = value;
        },
        clearOtp: (state) => { state.otp = ['', '', '', '']; },
        setOtpFlow: (state, action) => { state.otpFlow = action.payload; },
        toggleRememberMe: (state) => { state.rememberMe = !state.rememberMe; },
        setLoggedIn: (state, action) => { state.isLoggedIn = action.payload; },
        logout: (state) => {
            state.mobile = '';
            state.password = '';
            state.isLoggedIn = false;
        },
    },
});

export const { setName, setMobile, setPassword, setNewPassword, setConfirmPassword, setOtpDigit, clearOtp, setOtpFlow, toggleRememberMe, setLoggedIn, logout } = authSlice.actions;
export default authSlice.reducer;
