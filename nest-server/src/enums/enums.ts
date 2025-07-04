// user.enums.ts

// 회원유형
export enum UserType {
  INDIVIDUAL = 'individual', // 개인 회원
  CORPORATE = 'corporate', // 사업자 회원
  ADMIN = 'admin', // 관리자 회원
}

// 사업자 유형
export enum CorporateType {
  BUSINESS = 'business', // 기업 회원
  ORGANIZATION = 'organization', // 기관 회원
}

// 거래유형
export enum PaymentType {
  CHARGE = 'charge', // 포인트 충전
  USE = 'use', // 포인트 사용
}

// 충전유형
export enum ChargeType {
  CARD = 'card', // 카드 충전
  CASH = 'cash', // 현금 충전
  PAYPAL = 'paypal', // 페이팔 충전
  COUPON = 'coupon', // 쿠폰 충전
}

// 과금내역 관련 관리자 승인상태
export enum ChargeStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

// 이미지 분석상태
export enum ImageStatus {
  NOT_DETECTED = 'not_detected', // 분석안됨, 분석하기 전
  DETECTING = 'detecting', // 분석중
  DETECT_SUCCEED = 'detect_succeed', // 분석완료 (분석성공)
  DETECT_FAILED = 'detect_failed', //  분석실패
}

// 모델 타입
export enum ModelType {
  NIGHTLY = 'nightly', //nightly 모델
  STABLE = 'stable', // stable 모델
}

// 개인회원 단일 조회
export enum IndiUserType {
  EMAIL = 'email', // 이메일
  NAME = 'name', // 이름
}

// 사업자회원 단일 조회
export enum CorpUserType {
  CORPNAME = 'corporate_name', // 기업명
  BUSN_NUM = 'business_registration_number', // 사업자 등록번호
}
