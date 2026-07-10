// Backend API Base URL
// Reads from .env - requires `npx expo start -c` after changing IP
export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
export const AI_BASE_URL = process.env.EXPO_PUBLIC_AI_BASE_URL;
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!BASE_URL) {
  console.error("EXPO_PUBLIC_API_BASE_URL is not set in .env file");
} else {
  console.log("API BASE_URL:", BASE_URL);
}

if (!AI_BASE_URL) {
  console.error("EXPO_PUBLIC_AI_BASE_URL is not set in .env file");
} else {
  console.log("AI BASE_URL:", AI_BASE_URL);
}
