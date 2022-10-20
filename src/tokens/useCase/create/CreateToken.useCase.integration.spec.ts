import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';

import { CreateTokenUseCase } from './CreateToken.useCase';
import { TokenInMemoryRepository } from '@tokens/infra/repository/memory/Token.repository';

import { JwtServiceAdaptor } from '@tokens/infra/service/jwt/Jwt.service.adaptor';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';
import { JWT_OPTIONS_MOCK } from '@shared/utils/mocks/jwtOptions.mock';

describe('Integration tests for Create Token use case', () => {
  let tokenUseCase: CreateTokenUseCase;

  beforeEach(async () => {
    TokenInMemoryRepository.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      imports: [JwtModule.register(JWT_OPTIONS_MOCK)],
      providers: [
        CreateTokenUseCase,
        { provide: 'TOKEN_REPO', useClass: TokenInMemoryRepository },
        { provide: 'JWT_SERVICE', useClass: JwtServiceAdaptor },
      ],
    }).compile();

    tokenUseCase = module.get<CreateTokenUseCase>(CreateTokenUseCase);
  });

  it('should create a token with success', async () => {
    const newToken = await tokenUseCase.execute('1');

    expect(newToken).not.toBeNull();
    expect(typeof newToken).toBe('string');
    expect(newToken).not.toEqual('1');
  });
});
