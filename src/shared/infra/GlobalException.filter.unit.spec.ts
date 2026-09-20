import type { ArgumentsHost } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';

import { GlobalExceptionRestFilter } from '#shared/infra/GlobalException.filter';

class FakeDomainError extends Error {
  readonly domainErrorKind = 'invalidArgument' as const;
}

class FakeNotFoundError extends Error {
  readonly domainErrorKind = 'notFound' as const;
}

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

    filter.catch(new FakeDomainError('Invalid token type'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should map a DomainError by its kind instead of always defaulting to bad request', () => {
    const filter = new GlobalExceptionRestFilter();
    const { host, status } = fakeHttpHost();

    filter.catch(new FakeNotFoundError('Token not found'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('should map an unknown error to a generic 500', () => {
    const filter = new GlobalExceptionRestFilter();
    const { host, status } = fakeHttpHost();

    filter.catch(new Error('boom'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
