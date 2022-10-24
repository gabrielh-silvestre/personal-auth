import { v4 as uuid } from 'uuid';

import { Token } from './Token';
import { TokenType } from './token.interface';

const LAST_REFRESH = new Date();

describe('Unit test domain Token entity', () => {
  it('should create a new access token', () => {
    const token = new Token(
      uuid(),
      uuid(),
      LAST_REFRESH,
      false,
      TokenType.ACCESS,
    );

    expect(token).toBeDefined();

    expect(token.id).toBeDefined();
    expect(token.userId).toBeDefined();
    expect(token.lastRefresh).toBeDefined();

    expect(token.expires).toBeDefined();
    expect(token.revoked).toBeFalsy();

    expect(token.lastRefresh).toBeInstanceOf(Date);
    expect(token.expires).toBeInstanceOf(Date);

    expect(token.lastRefresh < token.expires).toBeTruthy();
    expect(token.type).toBe(TokenType.ACCESS);
  });

  it('should create a new recover password token', () => {
    const token = new Token(
      uuid(),
      uuid(),
      LAST_REFRESH,
      false,
      TokenType.RECOVER_PASSWORD,
    );

    expect(token).toBeDefined();

    expect(token.id).toBeDefined();
    expect(token.userId).toBeDefined();
    expect(token.lastRefresh).toBeDefined();

    expect(token.expires).toBeDefined();
    expect(token.revoked).toBeFalsy();

    expect(token.lastRefresh).toBeInstanceOf(Date);
    expect(token.expires).toBeInstanceOf(Date);

    expect(token.lastRefresh < token.expires).toBeTruthy();
    expect(token.type).toBe(TokenType.RECOVER_PASSWORD);
  });

  it('should refresh a access token', async () => {
    const token = new Token(
      uuid(),
      uuid(),
      LAST_REFRESH,
      false,
      TokenType.ACCESS,
    );
    const firstRefresh = token.expires;

    await new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
      token.refresh();

      expect(token.lastRefresh > LAST_REFRESH).toBeTruthy();
      expect(token.expires > firstRefresh).toBeTruthy();
    });
  });

  it('should not refresh a password recover token', () => {
    const token = new Token(
      uuid(),
      uuid(),
      LAST_REFRESH,
      false,
      TokenType.RECOVER_PASSWORD,
    );

    expect(() => token.refresh()).toThrowError(
      'Only access tokens can be refreshed',
    );
  });

  it('should revoke token', () => {
    const token = new Token(
      uuid(),
      uuid(),
      LAST_REFRESH,
      false,
      TokenType.ACCESS,
    );

    token.revoke();

    expect(token.revoked).toBeTruthy();
  });

  it('should check if token is valid', () => {
    const token = new Token(
      uuid(),
      uuid(),
      LAST_REFRESH,
      false,
      TokenType.ACCESS,
    );

    expect(token.isValid()).toBeTruthy();

    token.revoke();

    expect(token.isValid()).toBeFalsy();
  });

  it('should check if token is expired', () => {
    const token = new Token(
      uuid(),
      uuid(),
      LAST_REFRESH,
      false,
      TokenType.ACCESS,
    );

    expect(token.expiresIn()).toBeGreaterThan(0);
  });
});
