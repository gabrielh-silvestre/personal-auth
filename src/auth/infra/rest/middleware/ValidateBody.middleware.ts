import type { NextFunction, Request, Response } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class ValidateBodyMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const { email, password } = req.body;

    if (!email || !password) {
      throw ExceptionFactory.invalidArgument('Missing email or password');
    }

    next();
  }
}
