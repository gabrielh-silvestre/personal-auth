import { ExceptionFactory } from './Exception.factory';

const VALID_MESSAGE = 'message';

describe('Unit test domain Exception factory', () => {
  it('should create a new Not Found exception', () => {
    const exception = ExceptionFactory.notFound(VALID_MESSAGE);

    expect(exception).toBeDefined();
    expect(exception.code).toBe(5);
    expect(exception.status).toBe(404);
  });

  it('should create a new Conflict exception', () => {
    const exception = ExceptionFactory.conflict(VALID_MESSAGE);

    expect(exception).toBeDefined();
    expect(exception.code).toBe(6);
    expect(exception.status).toBe(409);
  });

  it('should create a new Invalid Argument exception', () => {
    const exception = ExceptionFactory.invalidArgument(VALID_MESSAGE);

    expect(exception).toBeDefined();
    expect(exception.code).toBe(3);
    expect(exception.status).toBe(400);
  });

  it('should create a new Internal exception', () => {
    const exception = ExceptionFactory.internal(VALID_MESSAGE);

    expect(exception).toBeDefined();
    expect(exception.code).toBe(13);
    expect(exception.status).toBe(500);
  });

  it('should create a new Forbidden exception', () => {
    const exception = ExceptionFactory.forbidden(VALID_MESSAGE);

    expect(exception).toBeDefined();
    expect(exception.code).toBe(7);
    expect(exception.status).toBe(403);
  });

  it('should create a new Unauthorized exception', () => {
    const exception = ExceptionFactory.unauthorized(VALID_MESSAGE);

    expect(exception).toBeDefined();
    expect(exception.code).toBe(16);
    expect(exception.status).toBe(401);
  });
});
