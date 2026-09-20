import { DomainError } from '#auth/domain/error/DomainError';

import { isDomainError } from '#shared/domain/error/domainError';

describe('Unit test isDomainError', () => {
  it('should accept an error with a valid domainErrorKind', () => {
    class FakeDomainError extends Error {
      readonly domainErrorKind = 'notFound' as const;
    }

    expect(isDomainError(new FakeDomainError('not found'))).toBe(true);
  });

  it('should reject a plain Error', () => {
    expect(isDomainError(new Error('boom'))).toBe(false);
  });

  it('should reject null and undefined', () => {
    expect(isDomainError(null)).toBe(false);
    expect(isDomainError(undefined)).toBe(false);
  });

  it('should reject a plain object carrying the right field but not an Error', () => {
    expect(isDomainError({ domainErrorKind: 'notFound' })).toBe(false);
  });

  it('should reject an error whose domainErrorKind is outside the accepted list', () => {
    class FakeInvalidKindError extends Error {
      readonly domainErrorKind = 'somethingElse';
    }

    expect(isDomainError(new FakeInvalidKindError('boom'))).toBe(false);
  });

  it('should accept the real DomainError from auth/domain, proving the structural contract', () => {
    expect(isDomainError(new DomainError('Invalid token type'))).toBe(true);
  });
});
