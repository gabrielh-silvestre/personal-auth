import { firstValueFrom } from 'rxjs';

import { DomainError } from '#auth/domain/error/DomainError';
import { Exception } from '#exceptions/entity/Exception';

import { ExceptionFilterRpc } from '#shared/infra/filter/ExceptionFilter.grpc';

describe('Unit test ExceptionFilterRpc', () => {
  it('should map a DomainError to an Exception instead of leaking the raw error', async () => {
    const filter = new ExceptionFilterRpc();

    await expect(
      firstValueFrom(filter.catch(new DomainError('Invalid token type'))),
    ).rejects.toBeInstanceOf(Exception);
  });

  it('should pass an Exception through unchanged', async () => {
    const filter = new ExceptionFilterRpc();
    const exception = new Exception('Invalid token', 3, 400);

    await expect(firstValueFrom(filter.catch(exception))).rejects.toBe(
      exception,
    );
  });
});
