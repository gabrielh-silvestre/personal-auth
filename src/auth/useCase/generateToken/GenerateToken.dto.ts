export type GenerateTokenType = 'recover';

export interface InputGenerateTokenDto {
  userId: string;
  type: GenerateTokenType;
}
