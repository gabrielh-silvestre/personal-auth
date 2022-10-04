import { UserFactory } from './User.factory';

describe('Test Domain User factory', () => {
  it('should create a new user', () => {
    const user = UserFactory.create('username', 'user@email.com');

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.username).toBe('username');
    expect(user.email).toBe('user@email.com');
  });
});
