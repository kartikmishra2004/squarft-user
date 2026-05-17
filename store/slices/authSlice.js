import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../services/authApi';
import { profileApi } from '../../services/profileApi';

export const loginThunk = createAsyncThunk('auth/login', async ({ phone, password }, { rejectWithValue }) => {
    try {
        return await authApi.login(phone, password);
    } catch (e) {
        return rejectWithValue(e.message);
    }
});


export const registerThunk = createAsyncThunk('auth/register', async ({ phone, password, first_name, last_name }, { rejectWithValue }) => {
    try {
        return await authApi.register(phone, password, first_name, last_name);
    } catch (e) {
        return rejectWithValue(e.message);
    }
});

export const sendOtpThunk = createAsyncThunk('auth/sendOtp', async ({ phone, purpose }, { rejectWithValue }) => {
    try {
        const response = await authApi.sendOtp(phone, purpose);
      
        if (response.otp) {
            console.log('🔐 OTP for testing:', response.otp);
            alert(`Development Mode: OTP is ${response.otp}`);
        }
        return response;
    } catch (e) {
        return rejectWithValue(e.message);
    }
});

// Verify OTP
export const verifyOtpThunk = createAsyncThunk('auth/verifyOtp', async ({ otp_token, otp }, { rejectWithValue }) => {
    try {
        return await authApi.verifyOtp(otp_token, otp);
    } catch (e) {
        return rejectWithValue(e.message);
    }
});

// Reset password
export const resetPasswordThunk = createAsyncThunk('auth/resetPassword', async ({ verified_token, new_password }, { rejectWithValue }) => {
    try {
        return await authApi.resetPassword(verified_token, new_password);
    } catch (e) {
        return rejectWithValue(e.message);
    }
});

// Fetch user profile
export const fetchProfileThunk = createAsyncThunk('auth/fetchProfile', async (_, { getState, rejectWithValue }) => {
    try {
        const { token } = getState().auth;
        if (!token) {
            throw new Error('No authentication token');
        }
        return await profileApi.getUserProfile(token);
    } catch (e) {
        return rejectWithValue(e.message);
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        name: '',
        email: '',
        mobile: '',
        password: '',
        newPassword: '',
        confirmPassword: '',
        otp: ['', '', '', '', '', ''],
        otpFlow: 'register',
        otpToken: null,
        verifiedToken: null,
        rememberMe: false,
        isLoggedIn: true,
        token: null,
        user: null,
        profile: null,
        loading: false,
        error: null,
    },
    reducers: {
        setName: (state, action) => { state.name = action.payload; },
        setEmail: (state, action) => { state.email = action.payload; },
        setMobile: (state, action) => { state.mobile = action.payload; },
        setPassword: (state, action) => { state.password = action.payload; },
        setNewPassword: (state, action) => { state.newPassword = action.payload; },
        setConfirmPassword: (state, action) => { state.confirmPassword = action.payload; },
        setOtpDigit: (state, action) => {
            const { index, value } = action.payload;
            state.otp[index] = value;
        },
        clearOtp: (state) => { state.otp = ['', '', '', '', '', '']; },
        setOtpFlow: (state, action) => { state.otpFlow = action.payload; },
        setOtpToken: (state, action) => { state.otpToken = action.payload; },
        setVerifiedToken: (state, action) => { state.verifiedToken = action.payload; },
        toggleRememberMe: (state) => { state.rememberMe = !state.rememberMe; },
        setLoggedIn: (state, action) => { state.isLoggedIn = action.payload; },
        clearError: (state) => { state.error = null; },
        clearAuthInputs: (state) => {
            state.password = '';
            state.newPassword = '';
            state.confirmPassword = '';
            state.otp = ['', '', '', '', '', ''];
            state.error = null;
        },
        logout: (state) => {
            state.mobile = '';
            state.email = '';
            state.password = '';
            state.token = null;
            state.user = null;
            state.profile = null;
            state.isLoggedIn = false;
            state.error = null;
            state.otpToken = null;
            state.verifiedToken = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.isLoggedIn = true;
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register
            .addCase(registerThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(registerThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Send OTP
            .addCase(sendOtpThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(sendOtpThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.otpToken = action.payload.otp_token;
            })
            .addCase(sendOtpThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Verify OTP
            .addCase(verifyOtpThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(verifyOtpThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.verifiedToken = action.payload.verified_token;
            })
            .addCase(verifyOtpThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reset Password
            .addCase(resetPasswordThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(resetPasswordThunk.fulfilled, (state) => {
                state.loading = false;
                state.verifiedToken = null;
            })
            .addCase(resetPasswordThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Profile
            .addCase(fetchProfileThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchProfileThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(fetchProfileThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    setName, setEmail, setMobile, setPassword, setNewPassword, setConfirmPassword,
    setOtpDigit, clearOtp, setOtpFlow, setOtpToken, setVerifiedToken, toggleRememberMe, 
    setLoggedIn, clearError, clearAuthInputs, logout,
} = authSlice.actions;
export default authSlice.reducer;
