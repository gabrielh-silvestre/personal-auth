import type { TokenPayloadDto } from '#auth/infra/strategy/JwtPayload.dto';

// Contract for the RMQ patterns guarded by AuthenticateGuard (auth.verify_token,
// auth.revoke_token): the publisher puts the raw access JWT at `token`, the field
// JwtAccessTokenStrategy's extractor reads via `(req) => req.token`. On success the
// guard attaches `user` to this same message object before the controller runs —
// in an 'rpc' ExecutionContext, switchToHttp().getRequest() and
// switchToRpc().getData() resolve to the same reference (see CredentialsGuard's
// convertRpcCredentialsToHttpBody for the proof), so the guard's write and the
// controller's read land on one object. No .proto covers this: it never leaves RMQ.
export interface AuthenticatedRmqMessage {
  token: string;
  user: TokenPayloadDto;
}
