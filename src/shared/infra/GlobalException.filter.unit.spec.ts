import type { ArgumentsHost } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';

import { DomainError } from '@auth/domain/error/DomainError.js';

import { GlobalExceptionRestFilter } from './GlobalException.filter.js';

function fakeHttpHost(): {
  host: ArgumentsHost;
  json: (body: unknown) => void;
  status: (code: number) => unknown;
} {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });

  const host = {
    getType: () => 'http',
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url: '/auth/refresh' }),
    }),
  } as unknown as ArgumentsHost;

  return { host, json, status };
}

describe('Unit test GlobalExceptionRestFilter', () => {
  it('should map a DomainError to a bad request instead of a generic 500', () => {
    const filter = new GlobalExceptionRestFilter();
    const { host, status } = fakeHttpHost();

    filter.catch(new DomainError('Invalid token type'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should map an unknown error to a generic 500', () => {
    const filter = new GlobalExceptionRestFilter();
    const { host, status } = fakeHttpHost();

    filter.catch(new Error('boom'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
