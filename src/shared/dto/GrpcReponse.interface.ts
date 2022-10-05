export interface GrpcErrorResponse {
  error: {
    code: number;
    message: string;
    status: number;
  };
}
