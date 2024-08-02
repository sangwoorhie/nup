import httpClient from './httpClient';
import { CouponData } from '../types';

// 관리자 회원조회
export const getAdminUsers = async (
  page: number,
  size: number,
  criteria?: string,
  value?: string
) => {
  let url = `/users/admin?page=${page}&size=${size}`;
  if (criteria && value) {
    url = `/users/admin/find?page=${page}&size=${size}&criteria=${criteria}&${criteria}=${value}`;
  }
  return await httpClient.get(url);
};

// 개인 회원조회
export const getUsers = async (
  page: number,
  size: number,
  criteria?: string,
  value?: string
) => {
  let url = `/users/admin/indi?page=${page}&size=${size}`;
  if (criteria && value) {
    url = `/users/admin/indi/find?page=${page}&size=${size}&criteria=${criteria}&${criteria}=${value}`;
  }
  return await httpClient.get(url);
};

// 일반회원을 관리자 회원으로 변경
export const promoteUser = async (userId: string) => {
  return await httpClient.patch(`/users/admin/promote?userId=${userId}`);
};

// 회원 계정 정지
export const banUser = async (
  userId: string,
  banUserReqDto: { reason: string }
) => {
  return await httpClient.patch(
    `/users/admin/ban?userId=${userId}`,
    banUserReqDto
  );
};

// 회원 계정 정지해제
export const unbanUser = async (userId: string) => {
  return await httpClient.patch(`/users/admin/unban?userId=${userId}`);
};

// 사업자회원 조회
export const getCorporateUsers = async (
  page: number,
  size: number,
  criteria?: string,
  value?: string
) => {
  let url = `/users/admin/corp?page=${page}&size=${size}`;
  if (criteria && value) {
    url = `/users/admin/corp/find?page=${page}&size=${size}&criteria=${criteria}&${criteria}=${value}`;
  }
  return await httpClient.get(url);
};

// 사업자등록증 확인처리
export const verifyBusinessLicense = async (corporateId: string) => {
  return await httpClient.patch(
    `/users/admin/corp/verify?corporateId=${corporateId}`
  );
};

// 쿠폰 템플릿 생성 (관리자)
export const createCouponTemplate = async (couponData: CouponData) => {
  return await httpClient.post('/coupon-templates', couponData);
};

// 쿠폰 템플릿 이름으로 조회하기
export const getCouponsByName = async (coupon_name: string) => {
  return await httpClient.get(`/coupon-templates/name`, {
    params: { coupon_name },
  });
};

// 쿠폰 탬플릿 발급일 기준으로 조회하기
export const getCouponsByDateRange = async (
  startDate: string,
  endDate: string,
  page: number,
  size: number
) => {
  return await httpClient.get(`/coupon-templates/date-range`, {
    params: {
      start_date: startDate,
      end_date: endDate,
      page,
      size,
    },
  });
};

// 쿠폰 템플릿 삭제하기
export const deleteCouponTemplate = async (templateId: string) => {
  return await httpClient.delete(`/coupon-templates/${templateId}`);
};

type Criteria = 'code' | 'username' | 'all' | 'used' | 'unused';

// 쿠폰 목록조회 (쿠폰 탬플릿 내 쿠폰 목록)
export const fetchCouponsByTemplateId = async (
  templateId: string,
  page: number,
  size: number,
  criteria: Criteria
) => {
  return await httpClient.get(`/coupon-templates/${templateId}/coupons`, {
    params: { page, size, criteria },
  });
};

// 쿠폰 코드 또는 사용회원 이름으로 쿠폰 조회
export const searchCoupons = async (
  templateId: string,
  criteria: 'code' | 'username',
  value: string,
  page: number,
  size: number
) => {
  let params: {
    page: number;
    size: number;
    criteria: string;
    code?: string;
    username?: string;
  } = { page, size, criteria };

  if (criteria === 'code') {
    params.code = value;
  } else if (criteria === 'username') {
    params.username = value;
  }

  return await httpClient.get(`/coupon-templates/${templateId}`, {
    params,
  });
};

// 단일 쿠폰 삭제
export const deleteCoupons = async (
  templateId: string,
  couponIds: string[]
) => {
  await Promise.all(
    couponIds.map((couponId) =>
      httpClient.delete(`/coupon-templates/${templateId}/coupons/${couponId}`)
    )
  );
};

// 단일 쿠폰 조회
export const findCoupon = async (templateId: string, couponId: string) => {
  return await httpClient.get(
    `/coupon-templates/${templateId}/coupons/${couponId}`
  );
};

// 현금충전 요청 조회
export const getCashChargeRequests = async (page: number, size: number) => {
  const response = await httpClient.get(
    `/payment-records/admin/charge?page=${page}&size=${size}`
  );
  return response.data;
};

// 현금충전 확인 또는 취소 처리
export const confirmCharges = async (chargeUpdates: any) => {
  return await httpClient.patch(`/payment-records/admin/charge`, chargeUpdates);
};

// 현금충전 요청 조회 (날짜별)
export const getCashChargeRequestsByDateRange = async (
  page: number,
  size: number,
  startDate: string,
  endDate: string
) => {
  const response = await httpClient.get('/payment-records/admin/date-range', {
    params: {
      page,
      size,
      start_date: startDate,
      end_date: endDate,
    },
  });
  return response.data;
};

// 현금충전 요청 삭제
export const deleteChargeRequests = async (ids: string[]) => {
  return await httpClient.delete('/payment-records/admin/charge', {
    data: { ids },
  });
};

// 회원 충전요청내역 조회 (관리자)
export const getUserChargeRequest = async (
  userId: string,
  page: number,
  size: number
) => {
  const url = `/payment-records/admin/charge-request/${userId}?page=${page}&size=${size}`;
  return await httpClient.get(url);
};

// 환불 요청 조회
export const getRefundRequests = async (page: number, size: number) => {
  const response = await httpClient.get('/refund-request/admin', {
    params: {
      page,
      size,
    },
  });
  return response.data;
};

// 환불 요청 완료 처리
export const completeRefundRequest = async (ids: string[]) => {
  return await httpClient.patch('/refund-request/admin/complete', { ids });
};

// 환불 요청 삭제
export const deleteRefundRequestAdmin = async (ids: string[]) => {
  return await httpClient.delete('/refund-request/admin/cancel', {
    data: { ids },
  });
};
