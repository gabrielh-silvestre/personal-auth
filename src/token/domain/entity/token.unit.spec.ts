import { v4 as uuid } from 'uuid';

import { Token } from './Token';

const LAST_REFRESH = new Date();
const PAST_REFRESH = new Date(new Date().getTime() - 1000 * 60 * 3);
const EXPIRES = new Date(new Date().getTime() + 1000 * 60 * 3);

describe('Unit test domain Token entity', () => {
  it('should create a new token', () => {
    const token = new Token(uuid(), uuid(), LAST_REFRESH, EXPIRES, false);

    expect(token).toBeDefined();

    expect(token.id).toBeDefined();
    expect(token.userId).toBeDefined();
    expect(token.lastRefresh).toBeDefined();

    expect(token.expires).toBeDefined();
    expect(token.revoked).toBeFalsy();

    expect(token.lastRefresh < token.expires).toBeTruthy();
  });

  it('should refresh token', () => {
    const token = new Token(uuid(), uuid(), PAST_REFRESH, LAST_REFRESH, false);
    const firstRefresh = token.expires;

    token.refresh();

    expect(token.lastRefresh > firstRefresh).toBeTruthy();
  });

  it('should revoke token', () => {
    const token = new Token(uuid(), uuid(), LAST_REFRESH, EXPIRES, false);

    token.revoke();

    expect(token.revoked).toBeTruthy();
  });

  it('should check if token is valid', () => {
    const token = new Token(uuid(), uuid(), LAST_REFRESH, EXPIRES, false);

    expect(token.isValid()).toBeTruthy();

    token.revoke();

    expect(token.isValid()).toBeFalsy();
  });

  it('should check if token is expired', () => {
    const token = new Token(uuid(), uuid(), LAST_REFRESH, EXPIRES, false);

    expect(token.expiresIn()).toBeGreaterThan(0);
  });
});
