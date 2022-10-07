export interface InputValidateUserDto {
  email: string;
  password: string;
}

export interface OutputValidateUserDto {
  id: string;
  username: string;
}
