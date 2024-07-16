import httpClient from './httpClient';

// 회원정보 수정 또는 삭제 시 비밀번호로 한번 더 본인 확인
export const doubleCheckPassword = async (
  password: string
): Promise<string> => {
  try {
    const { data } = await httpClient.post('/users/me/doublecheckpassword', {
      password,
    });
    return data.message;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Verification failed';
    throw new Error(`Problem in verification: ${message}`);
  }
};
