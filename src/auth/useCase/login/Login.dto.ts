export interface InputLoginDto {
  email: string;
  password: string;
}

export interface OutputLoginDto {
  tokenId: string;
  userId: string;
}
