export interface InputCreateUserDto {
  username: string;
  email: string;
  confirmEmail: string;
}

export interface OutputCreateUserDto {
  id: string;
  username: string;
}

export interface ReponseCreateUserDto {
  user: OutputCreateUserDto;
}
