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
  ResetPasswordPayloadType,
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

// 비밀번호 재설정
export const resetPassword = async (payload: ResetPasswordPayloadType) => {
  try {
    const { data } = await httpClient.post('/auth/reset-password', payload);
    return data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Reset password failed';
    throw new Error(`Problem in reset password: ${message}`);
  }
};

// 리프레시토큰 재발급
export const handleRefreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.error('No refresh token available');
    logout();
    return Promise.reject(new Error('No refresh token available'));
  }

  try {
    const { data } = await httpClient.post(
      '/auth/refresh',
      {},
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
      }
    );
    storeAccessTokenToLocal(data.accessToken);
    storeRefreshTokenToLocal(data.refreshToken);
    console.log('data', data);
    return data;
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    logout();
    return Promise.reject(error);
  }
};

// 로그아웃
export const logout = (navigate?: NavigateFunction) => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userType');
  localStorage.removeItem('userEmail');
  if (navigate) {
    navigate('/login');
  }
};

// Email 중복확인
export const checkEmailAvailability = async (email: string) => {
  return await httpClient.get(`/auth/checkemail?email=${email}`);
};

// 인증번호 확인
export const verifyAuthNumber = async (email: string, authNumber: string) => {
  return await httpClient.post('/auth/verify-auth-number', {
    email,
    authNumber,
  });
};

// 인증번호 전송
export const sendAuthNumber = async (email: string) => {
  return await httpClient.post('/auth/send-auth-number', { email });
};
