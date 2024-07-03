//  쿠폰 코드 랜덤생성
function generateRandomCouponCode(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [4, 4, 4, 4, 4, 4, 4];
  let couponCode = '';

  segments.forEach((segmentLength, index) => {
    for (let i = 0; i < segmentLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      couponCode += characters[randomIndex];
    }
    if (index < segments.length - 1) {
      couponCode += '-';
    }
  });

  return couponCode;
}

function generateMultipleCouponCodes(count: number): string[] {
  const couponCodes: string[] = [];
  for (let i = 0; i < count; i++) {
    couponCodes.push(generateRandomCouponCode());
  }
  return couponCodes;
}

// 예시 사용법
const numberOfCoupons = 5;
const coupons = generateMultipleCouponCodes(numberOfCoupons);
console.log(coupons);
