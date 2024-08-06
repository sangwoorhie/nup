export const CardIssuerName = {
  '3K': '기업BC',
  '46': '광주은행',
  '71': '롯데카드',
  '30': 'KDB산업은행',
  '31': 'BC카드',
  '51': '삼성카드',
  '38': '새마을금고',
  '41': '신한카드',
  '62': '신협',
  '36': '씨티카드',
  '33': '우리BC카드',
  W1: '우리카드',
  '37': '우체국예금보험',
  '39': '저축은행중앙회',
  '35': '전북은행',
  '42': '제주은행',
  '15': '카카오뱅크',
  '3A': '케이뱅크',
  '24': '토스뱅크',
  '21': '하나카드',
  '61': '현대카드',
  '11': '국민카드',
  '91': 'NH농협카드',
  '34': 'Sh수협은행',
} as const;

export type CardIssuerCode = keyof typeof CardIssuerName;

// https://velog.io/@from_numpy/%EC%A3%BC%EB%AC%B8-%EA%B2%B0%EC%A0%9C-2-toss-payments-%EA%B2%B0%EC%A0%9C-%ED%94%8C%EB%A1%9C%EC%9A%B0%EB%A5%BC-%EC%A0%81%EC%9A%A9%ED%95%B4%EB%B3%B4%EC%95%84%EC%9A%94-NestJS
// https://sjh9708.tistory.com/50
