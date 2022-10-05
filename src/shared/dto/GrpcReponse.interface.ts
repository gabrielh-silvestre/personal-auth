export interface GrpcErrorResponse {
  error: {
    code: number;
    message: string;
    status: number;
  };
}

export type GrpcReponse<T> = T | GrpcErrorResponse;
