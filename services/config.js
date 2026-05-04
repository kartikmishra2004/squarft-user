// Backend API Base URL
// Reads from .env - requires `npx expo start -c` after changing IP
export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  console.error('❌ EXPO_PUBLIC_API_BASE_URL is not set in .env file');
} else {
  console.log('🌐 API BASE_URL:', BASE_URL);
}
