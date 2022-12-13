import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common/interfaces';
import * as request from 'supertest';

import { AppModule } from '../../src/app.module';

import { GlobalExceptionRestFilter } from '@shared/infra/GlobalException.filter';
import { from } from 'rxjs';
import { ConfigModule } from '@nestjs/config';

const VALID_NEW_USER = {
  username: 'Johnny',
  email: 'johnny@email.com',
  confirmEmail: 'johnny@email.com',
  password: 'password',
  confirmPassword: 'password',
};

const VALID_LOGIN_USER = {
  email: VALID_NEW_USER.email,
  password: VALID_NEW_USER.password,
};

describe('Rest API (e2e)', () => {
  let app: INestApplication;

  const userServiceMock = {
    verifyCredentials: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: 'MAIL_SERVICE',
          useValue: {
            welcomeMail: jest.fn(),
            recoverPasswordMail: jest.fn(),
          },
        },
        {
          provide: 'USER_SERVICE',
          useValue: {
            verifyCredentials: userServiceMock.verifyCredentials,
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionRestFilter());

    await app.init();
  }, 15000);

  describe('/auth/login (POST)', () => {
    it('should login a user', async () => {
      userServiceMock.verifyCredentials.mockReturnValueOnce(
        from([{ id: '1' }]),
      );

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(VALID_LOGIN_USER)
        .expect(201);

      expect(response.body).toStrictEqual({
        _links: {
          self: {
            href: expect.any(String),
          },
        },
        data: {
          access: expect.any(String),
          refresh: expect.any(String),
        },
      });
    });

    it('should return a 401 if the credentials are invalid', async () => {
      userServiceMock.verifyCredentials.mockReturnValueOnce(from([null]));

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          ...VALID_LOGIN_USER,
          password: 'wrong pass',
        })
        .expect(403);

      expect(response.body).toStrictEqual({
        statusCode: 403,
        message: 'Invalid credentials',
        path: '/auth/login',
      });
    });
  });
});
