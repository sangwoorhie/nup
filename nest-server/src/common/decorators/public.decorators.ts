import { SetMetadata } from '@nestjs/common';

// 인증과정 생략
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
