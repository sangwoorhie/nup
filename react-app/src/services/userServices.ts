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

// 현금 충전
export const sendChargeEmail = async (
  amount: number,
  accountHolderName: string
) => {
  try {
    const response = await httpClient.post('/payment-records/charge', {
      amount,
      account_holder_name: accountHolderName,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to send charge email';
    throw new Error(message);
  }
};
