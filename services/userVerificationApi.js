import { BASE_URL } from "./config";

const parseResponse = async (response, fallbackMessage) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

const buildUploadForm = ({ documentType, file }) => {
  const formData = new FormData();
  formData.append("document_type", documentType);
  formData.append("file", {
    uri: file.uri,
    name: file.name || `${documentType}.jpg`,
    type: file.type || "image/jpeg",
  });
  return formData;
};

export const userVerificationApi = {
  getDocuments: async (token) => {
    const response = await fetch(`${BASE_URL}/api/v1/users/verification/documents`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return parseResponse(response, "Failed to fetch verification documents");
  },

  getStatus: async (token) => {
    const response = await fetch(`${BASE_URL}/api/v1/users/verification/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return parseResponse(response, "Failed to fetch verification status");
  },

  uploadDocument: async (token, { documentType, file }) => {
    const response = await fetch(`${BASE_URL}/api/v1/users/verification/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: buildUploadForm({ documentType, file }),
    });

    return parseResponse(response, "Failed to upload verification document");
  },

  updateDocument: async (token, { documentId, documentType, file }) => {
    const response = await fetch(`${BASE_URL}/api/v1/users/verification/documents/${documentId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: buildUploadForm({ documentType, file }),
    });

    return parseResponse(response, "Failed to update verification document");
  },
};
