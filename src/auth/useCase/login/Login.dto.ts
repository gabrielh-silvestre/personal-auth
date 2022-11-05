export interface InputLoginDto {
  email: string;
  password: string;
}

export interface OutputLoginDto {
  accessTokenId: string;
  refreshTokenId: string;
  userId: string;
}
