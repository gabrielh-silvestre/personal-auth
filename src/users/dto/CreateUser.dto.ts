import { GrpcErrorResponse } from 'src/shared/dto/GrpcReponse.interface';

export interface InputCreateUserDto {
  username: string;
  email: string;
  confirmEmail: string;
}

export interface OutputCreateUserDto {
  id: string;
  username: string;
}

export type GrpcCreateUserDto =
  | { user: OutputCreateUserDto }
  | GrpcErrorResponse;
