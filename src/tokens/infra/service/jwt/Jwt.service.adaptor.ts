import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { IJwtService } from './Jwt.service.interface';

@Injectable()
export class JwtServiceAdaptor<T> implements IJwtService<T> {
  constructor(private readonly jwtService: JwtService) {}

  async encrypt(data: T): Promise<string | never> {
    return this.jwtService.signAsync(data as object);
  }

  decrypt(token: string): Promise<T> {
    return this.jwtService.verifyAsync(token) as Promise<T>;
  }
}
