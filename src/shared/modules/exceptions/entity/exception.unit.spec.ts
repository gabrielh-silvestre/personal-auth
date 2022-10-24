import { Exception } from './Exception';

describe('Unit test domain Exception entity', () => {
  it('should create a new exception', () => {
    const exception = new Exception('message', 1, 1);

    expect(exception).toBeDefined();
    expect(exception.code).toBe(1);
    expect(exception.status).toBe(1);

    expect(exception).toBeInstanceOf(Error);
  });
});
