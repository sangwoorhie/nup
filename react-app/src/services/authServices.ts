import httpClient from './httpClient';
import { NavigateFunction } from 'react-router-dom';
import {
  UserRegisterPayloadType,
  UserLoginPayloadType,
  ApiKeyLoginPayloadType,
} from '../types';

// 개인 회원가입
export const signupIndividual = async (
  payload: UserRegisterPayloadType,
  navigate: NavigateFunction
) => {
  try {
    const { data } = await httpClient.post('/auth/signup1', payload);
    storeAccessTokenToLocal(data.accessToken);
    storeRefreshTokenToLocal(data.refreshToken);
    navigate('/user-profile');
    alert('개인 회원가입에 성공했습니다.');
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
  navigate: NavigateFunction
) => {
  try {
    const { data } = await httpClient.post('/auth/signup2', payload);
    storeAccessTokenToLocal(data.accessToken);
    storeRefreshTokenToLocal(data.refreshToken);
    navigate('/user-profile');
    alert('사업자 회원가입에 성공했습니다.');
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
    navigate('/user-profile');
    alert('로그인 되었습니다.');
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Login failed';
    alert(`Problem in login: ${message}`);
    console.error(error);
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
    navigate('/user-profile');
    alert('로그인 되었습니다.');
  } catch (error: any) {
    const message =
    error.response?.data?.message || error.message || 'Login failed';
  alert(`Problem in login: ${message}`);
  console.error(error);
  }
};

// 리프레시토큰 재발급
export const handleRefreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const { data } = await httpClient.post('/auth/refresh', { refreshToken });
    storeAccessTokenToLocal(data.accessToken);
    storeRefreshTokenToLocal(data.refreshToken);
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    logout();
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

const storeAccessTokenToLocal = (accessToken: string): void =>
  localStorage.setItem('accessToken', accessToken);

const storeRefreshTokenToLocal = (refreshToken: string): void =>
  localStorage.setItem('refreshToken', refreshToken);