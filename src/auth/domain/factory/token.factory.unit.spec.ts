import type { TokenType } from '../entity/token.interface';

import { TokenFactory } from './Token.factory';

const VALID_USER_ID = '5f4d2e2e-2b9a-4da3-9d5b-1b8e7b3dcb6d';

describe('Test domain Token factory', () => {
  it('should create a new access token', () => {
    const token = TokenFactory.createAccessToken(VALID_USER_ID);

    expect(token).toBeDefined();

    expect(token.id).toBeDefined();
    expect(token.userId).toBeDefined();
    expect(token.lastRefresh).toBeDefined();

    expect(token.expires).toBeDefined();
    expect(token.revoked).toBeFalsy();

    expect(token.lastRefresh < token.expires).toBeTruthy();
    expect(token.type).toBe('ACCESS');

    const accessToken = TokenFactory.createTokenFromType(
      'ACCESS',
      VALID_USER_ID,
    );

    expect(accessToken).toBeDefined();
    expect(token.type).toBe('ACCESS');
  });

  it('should create a new recover password token', () => {
    const token = TokenFactory.createRecoverPasswordToken(VALID_USER_ID);

    expect(token).toBeDefined();

    expect(token.id).toBeDefined();
    expect(token.userId).toBeDefined();
    expect(token.lastRefresh).toBeDefined();

    expect(token.expires).toBeDefined();
    expect(token.revoked).toBeFalsy();

    expect(token.lastRefresh < token.expires).toBeTruthy();
    expect(token.type).toBe('RECOVER_PASSWORD');

    const recoverPasswordToken = TokenFactory.createTokenFromType(
      'RECOVER_PASSWORD',
      VALID_USER_ID,
    );

    expect(recoverPasswordToken).toBeDefined();
    expect(recoverPasswordToken.type).toBe('RECOVER_PASSWORD');
  });

  it('should create a new refresh token', () => {
    const token = TokenFactory.createRefreshToken(VALID_USER_ID);

    expect(token).toBeDefined();

    expect(token.id).toBeDefined();
    expect(token.userId).toBeDefined();
    expect(token.lastRefresh).toBeDefined();

    expect(token.expires).toBeDefined();
    expect(token.revoked).toBeFalsy();

    expect(token.lastRefresh < token.expires).toBeTruthy();
    expect(token.type).toBe('REFRESH');

    const refreshToken = TokenFactory.createTokenFromType(
      'REFRESH',
      VALID_USER_ID,
    );

    expect(refreshToken).toBeDefined();
    expect(refreshToken.type).toBe('REFRESH');
  });

  it('should throw an error when create a token with invalid type', () => {
    expect(() =>
      TokenFactory.createTokenFromType(
        'INVALID_TYPE' as TokenType,
        VALID_USER_ID,
      ),
    ).toThrowError('Invalid token type');
  });
});
