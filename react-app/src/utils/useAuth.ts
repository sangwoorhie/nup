import { jwtDecode } from 'jwt-decode';

type AccessTokenType = {
  email: string;
  isLoggedIn: boolean;
  id: string;
  userType: string;
};

const useAuth = (): boolean => {
  let accessToken = localStorage.getItem('accessToken');

  if (!accessToken) return false;
  const decoded = jwtDecode<AccessTokenType>(accessToken);
  return decoded.isLoggedIn;
};

export const getAuthUser = (): AccessTokenType | null => {
  let accessToken = localStorage.getItem('accessToken');

  if (!accessToken) return null;
  const decoded = jwtDecode<AccessTokenType>(accessToken);
  return decoded.isLoggedIn ? decoded : null;
};

export default useAuth;
