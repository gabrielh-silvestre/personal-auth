import { v4 as uuid } from 'uuid';

import { User } from '../../../domain/entity/User';
import { UserInMemoryRepository } from './User.repository';

const USERS_MOCK: User[] = [
  new User(uuid(), 'John', 'john@email.com'),
  new User(uuid(), 'Doe', 'doe@email.com'),
  new User(uuid(), 'Jane', 'jane@email.com'),
];

describe('Test Infra in memory user repository', () => {
  beforeEach(() => {
    UserInMemoryRepository.reset(USERS_MOCK);
  });

  it('should create a user', async () => {
    const userRepository = new UserInMemoryRepository();
    const newUser = new User(uuid(), 'Joe', 'joe@email.com');

    await userRepository.create(newUser);

    const foundUser = await userRepository.find(newUser.id);

    expect(foundUser).not.toBeNull();
    expect(foundUser?.id).toBeDefined();
    expect(foundUser?.username).toBe('Joe');
    expect(foundUser?.email).toBe('joe@email.com');
  });

  it('should update a user', async () => {
    const userRepository = new UserInMemoryRepository();
    const [userToUpdate] = USERS_MOCK;
    userToUpdate.changeUsername('Johny');

    await userRepository.update(userToUpdate);

    const foundUser = await userRepository.find(userToUpdate.id);

    expect(foundUser).not.toBeNull();
    expect(foundUser?.id).toBeDefined();
    expect(foundUser?.username).toBe('Johny');
    expect(foundUser?.email).toBe(userToUpdate.email);
  });

  it('should find a user by id', async () => {
    const userRepository = new UserInMemoryRepository();
    const [userToFind] = USERS_MOCK;

    const foundUser = await userRepository.find(userToFind.id);

    expect(foundUser).not.toBeNull();
  });

  it('should check if a user exists by email', async () => {
    const userRepository = new UserInMemoryRepository();
    const [userToFind] = USERS_MOCK;

    const exists = await userRepository.existsByEmail(userToFind.email);

    expect(exists).toBeTruthy();
  });
});
