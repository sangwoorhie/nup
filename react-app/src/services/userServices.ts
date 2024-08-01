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

// 사용된 쿠폰목록 조회
export const getUsedCoupons = async (page: number, size: number) => {
  return httpClient.get(`/coupons/used?page=${page}&size=${size}`);
};

// 유저 본인 포인트충전 기록 조회
export const getChargeHistory = async (page: number, size: number) => {
  try {
    const response = await httpClient.get(
      `/payment-records/charge?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch charge history';
    throw new Error(message);
  }
};

// 포인트충전 기록 삭제
export const deleteChargeHistory = async (id: string) => {
  try {
    if (!id) throw new Error('Invalid ID');
    const response = await httpClient.delete(`/payment-records/charge/${id}`);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to delete charge history';
    throw new Error(message);
  }
};

// 단일 쿠폰 삭제
export const removeCoupon = async (id: string) => {
  try {
    if (!id) throw new Error('Invalid ID');
    const response = await httpClient.delete(`/coupons/${id}`);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to delete coupon';
    throw new Error(message);
  }
};

// 본인 포인트 충전 요청 기록 날짜별 조회
export const getChargeHistoryByDateRange = async (
  start_date: string,
  end_date: string,
  page: number,
  size: number
) => {
  try {
    const response = await httpClient.get(
      `/payment-records/charge/date-range?page=${page}&size=${size}&start_date=${start_date}&end_date=${end_date}`
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch charge history by date range';
    throw new Error(message);
  }
};

// 유저 본인 포인트 조회 (사용자)
export const getUserPoints = async () => {
  try {
    const response = await httpClient.get('/refund-request');
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch user points';
    throw new Error(message);
  }
};

// 환불 요청
export const requestRefund = async (formData: FormData) => {
  try {
    const response = await httpClient.post('/refund-request', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to request refund';
    throw new Error(message);
  }
};
