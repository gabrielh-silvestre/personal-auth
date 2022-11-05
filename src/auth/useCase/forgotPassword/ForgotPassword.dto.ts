export interface InputForgotPasswordDto {
  email: string;
}

export interface OutputForgotPasswordDto {
  tokenId: string;
  userId: string;
}
