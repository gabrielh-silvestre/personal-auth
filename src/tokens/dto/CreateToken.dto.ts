export interface InputCreateTokenDto {
  userId: string;
}

export interface OutputCreateTokenDto {
  token: string;
}

export interface JwtTokenPayload {
  tokenId: string;
  userId: string;
}
