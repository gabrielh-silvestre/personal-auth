import { v4 as uuid } from 'uuid';

import { Token } from './Token';

const LAST_REFRESH = new Date();

describe('Unit test domain Token entity', () => {
  it('should create a new token', () => {
    const token = new Token(uuid(), uuid(), LAST_REFRESH, false);

    expect(token).toBeDefined();

    expect(token.id).toBeDefined();
    expect(token.userId).toBeDefined();
    expect(token.lastRefresh).toBeDefined();

    expect(token.expires).toBeDefined();
    expect(token.revoked).toBeFalsy();

    expect(token.lastRefresh).toBeInstanceOf(Date);
    expect(token.expires).toBeInstanceOf(Date);

    expect(token.lastRefresh < token.expires).toBeTruthy();
  });

  it('should refresh token', async () => {
    const token = new Token(uuid(), uuid(), LAST_REFRESH, false);
    const firstRefresh = token.expires;

    await new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
      token.refresh();

      expect(token.lastRefresh > LAST_REFRESH).toBeTruthy();
      expect(token.expires > firstRefresh).toBeTruthy();
    });
  });

  it('should revoke token', () => {
    const token = new Token(uuid(), uuid(), LAST_REFRESH, false);

    token.revoke();

    expect(token.revoked).toBeTruthy();
  });

  it('should check if token is valid', () => {
    const token = new Token(uuid(), uuid(), LAST_REFRESH, false);

    expect(token.isValid()).toBeTruthy();

    token.revoke();

    expect(token.isValid()).toBeFalsy();
  });

  it('should check if token is expired', () => {
    const token = new Token(uuid(), uuid(), LAST_REFRESH, false);

    expect(token.expiresIn()).toBeGreaterThan(0);
  });
});
