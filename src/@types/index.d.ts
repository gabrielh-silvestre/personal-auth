declare namespace Express {
  export interface Request {
    user: {
      userId: string;
      tokenId: string;
    };
  }
}
