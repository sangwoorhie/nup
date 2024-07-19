import httpClient from './httpClient';

export const getUsers = async (
  page: number,
  size: number,
  criteria?: string,
  value?: string
) => {
  let url = `/users/admin/indi?page=${page}&size=${size}`;
  if (criteria && value) {
    url += `&criteria=${criteria}&${criteria}=${value}`;
  }
  return await httpClient.get(url);
};

export const promoteUser = async (userId: string) => {
  return await httpClient.patch(`/users/admin/promote?userId=${userId}`);
};

export const banUser = async (
  userId: string,
  banUserReqDto: { reason: string }
) => {
  return await httpClient.patch(
    `/users/admin/ban?userId=${userId}`,
    banUserReqDto
  );
};

export const unbanUser = async (userId: string) => {
  return await httpClient.patch(`/users/admin/unban?userId=${userId}`);
};
