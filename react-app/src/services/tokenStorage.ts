export const storeAccessTokenToLocal = (accessToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
};

export const storeRefreshTokenToLocal = (refreshToken: string): void => {
  localStorage.setItem('refreshToken', refreshToken);
};
