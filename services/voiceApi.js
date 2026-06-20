import { AI_BASE_URL } from "./config";

/**
 * Voice Agent API Service
 * 
 * Handles LiveKit token generation for voice calls with the AI agent.
 */

/**
 * Request a LiveKit connection token for voice call
 * 
 * @param {string} phoneNumber - User's phone number in E.164 format (+919876543210)
 * @param {string} name - User's display name
 * @returns {Promise<{token: string, url: string, room_name: string, identity: string}>}
 */
export async function requestVoiceCallToken(phoneNumber, name) {
  if (!AI_BASE_URL) {
    throw new Error("AI service URL is not configured. Please set EXPO_PUBLIC_AI_BASE_URL in .env");
  }

  const response = await fetch(`${AI_BASE_URL}/api/v1/calls/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
      name: name,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get call token: ${error}`);
  }

  const data = await response.json();
  
  return {
    token: data.token,
    url: data.url,
    room_name: data.room_name,
    identity: data.identity,
  };
}

export const voiceApi = {
  requestVoiceCallToken,
};
