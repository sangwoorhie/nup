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
