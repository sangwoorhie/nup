export type UserType = {
  id?: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
};

export type UserRegisterPayloadType = {
  username: string;
  email: string;
  password: string;
};

export type UserLoginPayloadType = {
  email: string;
  password: string;
};

export type ApiKeyLoginPayloadType = {
  apiKey: string;
};

// 어드민 유저 E-mail 로그인
export type AdminUserEmail = {
  email: string;
  password: string;
};

// 어드민 유저 API-Key 로그인
export type AdminUserApi = {
  apikey: string;
};

// 개인회원 E-mail 로그인

// 개인회원 API-Key 로그인

// 사업자회원 E-mail 로그인

// 사업자회원 API-Key 로그인
