import type { TokenPayloadDto } from './JwtPayload.dto';

/** Payload publicado no pattern RMQ `auth.verify_token` / `auth.revoke_token`: o JWT a validar. */
export interface VerifyTokenMessageDto {
  token: string;
}

/** O que o handler recebe depois do `AuthenticateGuard`, que anexa o payload do JWT à mensagem. */
export interface AuthenticatedMessageDto {
  user: TokenPayloadDto;
}
