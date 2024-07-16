import httpClient from './httpClient';
import { NavigateFunction } from 'react-router-dom';
import {
  storeAccessTokenToLocal,
  storeRefreshTokenToLocal,
} from './tokenStorage';
import {
  UserRegisterPayloadType,
  UserLoginPayloadType,
  ApiKeyLoginPayloadType,
} from '../types';

// 개인 회원가입
export const signupIndividual = async (
  payload: UserRegisterPayloadType,
  setCurrentStep: (step: number) => void
) => {
  try {
    const { data } = await httpClient.post('/auth/signup1', payload);
    storeAccessTokenToLocal(data.accessToken);
    storeRefreshTokenToLocal(data.refreshToken);
    alert('개인 회원가입에 성공했습니다.');
    setCurrentStep(3); // Move to the next step after the alert
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Signup failed';
    alert(`Problem in Signup: ${message}`);
    console.error(error);
  }
};

// 사업자 회원가입
export const signupCorporate = async (
  payload: UserRegisterPayloadType,
  setCurrentStep: (step: number) => void
) => {
  try {
    const { data } = await httpClient.post('/auth/signup2', payload);
    storeAccessTokenToLocal(data.accessToken);
    storeRefreshTokenToLocal(data.refreshToken);
    alert('사업자 회원가입에 성공했습니다.');
    setCurrentStep(4); // Move to the next step after the alert
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Signup failed';
    alert(`Problem in Signup: ${message}`);
    console.error(error);
  }
};

// Email, Password 로그인
export const login = async (
  payload: UserLoginPayloadType,
  navigate: NavigateFunction
) => {
  try {
    const { data } = await httpClient.post('/auth/signin', payload);
    storeAccessTokenToLocal(data.accessToken);
    storeRefreshTokenToLocal(data.refreshToken);
    localStorage.setItem('userType', data.userType); // Store user type
    localStorage.setItem('userEmail', payload.email); // Store user email
    alert('로그인 되었습니다.');
    navigate('/user-profile');
    return data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Login failed';
    throw new Error(`Problem in login: ${message}`);
  }
};

// API-Key 로그인
export const loginWithApiKey = async (
  payload: ApiKeyLoginPayloadType,
  navigate: NavigateFunction
) => {
  try {
    const { data } = await httpClient.post('/auth/signin/api-key', payload);
    storeAccessTokenToLocal(data.accessToken);
    storeRefreshTokenToLocal(data.refreshToken);
    localStorage.setItem('userType', data.userType); // Store user type
    // localStorage.setItem('userEmail', payload.email); // Store user email
    alert('로그인 되었습니다.');
    navigate('/user-profile');
    return data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Login failed';
    throw new Error(`Problem in login: ${message}`);
  }
};

interface RefreshResDto {
  accessToken: string;
  refreshToken: string;
}

// 리프레시토큰 재발급
export const handleRefreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    const { data }: { data: RefreshResDto } = await httpClient.post(
      '/auth/refresh',
      { refreshToken }
    );
    storeAccessTokenToLocal(data.accessToken);
    storeRefreshTokenToLocal(data.refreshToken); // Note the naming consistency
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    logout(); // Ensure the user is logged out if refreshing fails
  }
};

// 로그아웃
export const logout = (navigate?: NavigateFunction) => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  if (navigate) {
    navigate('/login');
  }
};

// Email 중복확인
export const checkEmailAvailability = async (email: string) => {
  return await httpClient.get(`/auth/checkemail?email=${email}`);
};
