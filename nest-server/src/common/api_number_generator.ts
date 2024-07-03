// API Key 랜덤 생성
export function generateRandomSerialNumberCode(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segmentLength = 4;
  const numberOfSegments = 7;
  let couponCode = '';

  for (let i = 0; i < numberOfSegments; i++) {
    for (let j = 0; j < segmentLength; j++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      couponCode += characters[randomIndex];
    }
    if (i < numberOfSegments - 1) {
      couponCode += '-';
    }
  }

  return couponCode;
}

export function generateSerialNumberForIPs(ipInput: string): string {
  const ipAddresses = ipInput.split(',').map((ip) => ip.trim());
  const serialNumber = generateRandomSerialNumberCode();

  console.log('IP Addresses:', ipAddresses);
  console.log('Generated Serial Number:', serialNumber);

  return serialNumber;
}

// 예시 사용법
const ipInput = '192.168.0.1, 10.0.0.1, 172.16.0.1';
const serialNumber = generateSerialNumberForIPs(ipInput);
console.log(serialNumber);
