import { AI_BASE_URL } from "./config";

function parseMaybeJson(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function normalizeChatResponse(data) {
  const parsedReply = parseMaybeJson(data?.reply);
  const raw = data?.raw || parsedReply || data || {};

  return {
    sessionId: data?.sessionId || null,
    reply:
      raw?.message ||
      raw?.error ||
      data?.message ||
      (parsedReply ? "" : data?.reply) ||
      "",
    properties: Array.isArray(data?.properties)
      ? data.properties
      : Array.isArray(raw?.properties)
        ? raw.properties
        : [],
    slots: Array.isArray(data?.slots)
      ? data.slots
      : Array.isArray(raw?.slots)
        ? raw.slots
        : [],
    customer_number: data?.customer_number || raw?.customer_number || null,
    raw,
  };
}

async function request(path, { message, sessionId, token } = {}) {
  if (!AI_BASE_URL) {
    throw new Error("AI service URL is not configured.");
  }

  const response = await fetch(`${AI_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      message,
      ...(sessionId ? { sessionId } : {}),
    }),
  });

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || "Unexpected response from AI service." };
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || "Chat request failed.");
  }

  return normalizeChatResponse(data);
}

export const chatApi = {
  sendMessage: ({ message, sessionId, token }) =>
    request("/chat/message", { message, sessionId, token }),
};
