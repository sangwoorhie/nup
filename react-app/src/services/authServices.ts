import httpClient from './httpClient';
import { NavigateFunction } from 'react-router-dom';
import {
  storeAccessTokenToLocal,
  storeRefreshTokenToLocal,
} from './tokenStorage';
import {
  // UserRegisterPayloadType,
  UserLoginPayloadType,
  ApiKeyLoginPayloadType,
  ResetPasswordPayloadType,
  // IndiSignUpPayloadType,
  // CorpSignUpPayloadType,
} from '../types';

// 개인 회원가입
export const signupIndividual = async (
  payload: FormData,
  setCurrentStep: (step: number) => void
) => {
  try {
    const { data } = await httpClient.post('/auth/signup1', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
  payload: FormData,
  setCurrentStep: (step: number) => void
) => {
  try {
    const { data } = await httpClient.post('/auth/signup2', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
    // console.log('data', data);
    storeAccessTokenToLocal(data.accessToken);
    storeRefreshTokenToLocal(data.refreshToken);
    localStorage.setItem('userType', data.userType); // Store user type
    localStorage.setItem('userEmail', data.email); // Store user email
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

// 구글 로그인
export const handleGoogleLogin = async (
  credential: string,
  navigate: NavigateFunction
) => {
  try {
    const { data } = await httpClient.post('/auth/google/callback', {
      credential,
    }); // POST request with the credential

    if (data.isNewUser || !data.userType) {
      // Navigate to sign-up modal if new user
      return { isNewUser: true, userId: data.userId, userType: data.userType };
    }

    // Store tokens for an existing user
    storeAccessTokenToLocal(data.accessToken);
    storeRefreshTokenToLocal(data.refreshToken);
    localStorage.setItem('userType', data.userType);
    localStorage.setItem('userEmail', data.email);

    alert('Login successful');
    navigate('/user-profile');
    return { isNewUser: false };
  } catch (error) {
    console.error('Google login failed:', error);
    throw new Error('Google login failed.');
  }
};

// 구글 소셜로그인 개인 회원가입
export const handleIndiSignUp = async (
  userId: string,
  indiSignUpData: FormData
) => {
  try {
    const { data } = await httpClient.post(
      `/auth/google/signup1/${userId}`,
      indiSignUpData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  } catch (error: any) {
    console.error('Individual signup error:', error.response || error);
    if (error.response) {
      throw new Error(
        `Individual signup failed: ${error.response.data.message || error.response.statusText}`
      );
    } else if (error.request) {
      throw new Error(
        'Individual signup failed: No response received from server'
      );
    } else {
      throw new Error(`Individual signup failed: ${error.message}`);
    }
  }
};

// 구글 소셜로그인 사업자 회원가입
export const handleCorpSignUp = async (
  userId: string,
  corpSignUpData: FormData
) => {
  try {
    console.log('Sending corporate signup data to server:');
    corpSignUpData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    const { data } = await httpClient.post(
      `/auth/google/signup2/${userId}`,
      corpSignUpData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log('Server response:', data);
    return data;
  } catch (error: any) {
    console.error('Corporate signup error:', error.response || error);
    if (error.response) {
      throw new Error(
        `Corporate signup failed: ${error.response.data.message || error.response.statusText}`
      );
    } else if (error.request) {
      throw new Error(
        'Corporate signup failed: No response received from server'
      );
    } else {
      throw new Error(`Corporate signup failed: ${error.message}`);
    }
  }
};
