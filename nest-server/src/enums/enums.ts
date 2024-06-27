// user.enums.ts

// 회원유형 1
export enum UserType1 {
  NORMAL = 'normal', // 일반 회원
  ADMIN = 'admin', // 관리자 회원
}

// 회원유형 2
export enum UserType2 {
  INDIVIDUAL = 'individual', // 개인 회원
  CORPORATE = 'corporate', // 사업자 회원
}

// 회원유형 3
export enum UserType3 {
  WEB = 'web', // WEB 회원
  API = 'api', // API 회원
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
