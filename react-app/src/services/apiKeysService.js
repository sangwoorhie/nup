import httpClient from './httpClient';

// 사용자 영역
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

// 관리자 영역
export const listApiKeysAdmin = async (page, size) => {
  return await httpClient.get(`/api-keys/admin/list?page=${page}&size=${size}`);
};

export const toggleApiKeyStatusAdmin = async (apiKey) => {
  return await httpClient.patch(`/api-keys/admin/active?api_key=${apiKey}`);
};

export const updateApiKeyIpsAdmin = async (apiKey, updateApiKeyReqDto) => {
  return await httpClient.patch(
    `/api-keys/admin/update-ips?api_key=${apiKey}`,
    updateApiKeyReqDto
  );
};

export const listApiKeysSearchAdmin = async (page, size, criteria, value) => {
  return await httpClient.get(
    `/api-keys/admin/search?page=${page}&size=${size}&criteria=${criteria}&${criteria}=${value}`
  );
};
