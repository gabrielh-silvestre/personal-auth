import { TokenFactory } from './Token.factory';

const VALID_USER_ID = '5f4d2e2e-2b9a-4da3-9d5b-1b8e7b3dcb6d';

describe('Test domain Token factory', () => {
  it('should create a new token', () => {
    const token = TokenFactory.create(VALID_USER_ID);

    expect(token).toBeDefined();

    expect(token.id).toBeDefined();
    expect(token.userId).toBeDefined();
    expect(token.lastRefresh).toBeDefined();

    expect(token.expires).toBeDefined();
    expect(token.revoked).toBeFalsy();

    expect(token.lastRefresh < token.expires).toBeTruthy();
  });
});