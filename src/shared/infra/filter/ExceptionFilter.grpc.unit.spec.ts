import type { ArgumentsHost } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { Exception } from '#exceptions/entity/Exception';

import { ExceptionFilterRpc } from '#shared/infra/filter/ExceptionFilter.grpc';

class FakeDomainError extends Error {
  readonly domainErrorKind = 'invalidArgument' as const;
}

const host = {} as ArgumentsHost;

describe('Unit test ExceptionFilterRpc', () => {
  it('should map a DomainError to an Exception instead of leaking the raw error', async () => {
    const filter = new ExceptionFilterRpc();

    await expect(
      firstValueFrom(
        filter.catch(new FakeDomainError('Invalid token type'), host),
      ),
    ).rejects.toBeInstanceOf(Exception);
  });

  it('should pass an Exception through unchanged', async () => {
    const filter = new ExceptionFilterRpc();
    const exception = new Exception('Invalid token', 3, 400);

    await expect(firstValueFrom(filter.catch(exception, host))).rejects.toBe(
      exception,
    );
  });

  it('should sanitize an unexpected error instead of leaking it to the client', async () => {
    const filter = new ExceptionFilterRpc();
    const exception = new Error('connection string with credentials');

    const rejection = await firstValueFrom(filter.catch(exception, host)).catch(
      (error) => error,
    );

    expect(rejection).not.toBe(exception);
    expect(rejection).toEqual({ status: 'error', message: expect.any(String) });
    expect(rejection.message).not.toBe(exception.message);
  });
});
