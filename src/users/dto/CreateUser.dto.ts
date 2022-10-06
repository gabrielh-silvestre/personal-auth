export interface InputCreateUserDto {
  username: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
}

export interface OutputCreateUserDto {
  id: string;
  username: string;
}
