import httpClient from './httpClient';

export const createApiKey = (ips) => {
  return httpClient.post('/api-keys/create', { ips });
};

export const listApiKeys = (page, size) => {
  return httpClient.get(`/api-keys/list?page=${page}&size=${size}`);
};

export const updateApiKeyIps = (apiKey, ips) => {
  return httpClient.patch(`/api-keys/update-ips?api_key=${apiKey}`, { ips });
};

export const toggleApiKeyStatus = (apiKey) => {
  return httpClient.patch(`/api-keys/active?api_key=${apiKey}`);
};
