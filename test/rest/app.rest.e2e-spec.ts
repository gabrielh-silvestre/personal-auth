import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common/interfaces';
import * as request from 'supertest';

import { AppModule } from '../../src/app.module';

import { GlobalExceptionRestFilter } from '@shared/infra/GlobalException.filter';

import { resetUsersDb } from '../../prisma/reset';

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
  let token: string;

  beforeAll(async () => {
    await resetUsersDb();
  });

  afterAll(async () => {
    await resetUsersDb();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionRestFilter());

    await app.init();
  });

  describe('/users (POST)', () => {
    it('should create a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(VALID_NEW_USER)
        .expect(201);

      expect(response.body).toStrictEqual({
        _links: {
          self: {
            href: expect.any(String),
          },
        },
        data: {
          id: expect.any(String),
          username: expect.any(String),
        },
      });
    });

    it('should return a 409 if the user already exists', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(VALID_NEW_USER)
        .expect(409);

      expect(response.body).toStrictEqual({
        statusCode: 409,
        message: 'Email already registered',
        path: '/users',
      });
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login a user', async () => {
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
          token: expect.any(String),
        },
      });
    });

    it('should return a 401 if the credentials are invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          ...VALID_LOGIN_USER,
          password: 'wrong pass',
        })
        .expect(403);

      expect(response.body).toStrictEqual({
        statusCode: 403,
        message: 'Forbidden resource',
        path: '/auth/login',
      });
    });
  });

  describe('/users/me/:token (GET)', () => {
    it('should recover a user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send(VALID_LOGIN_USER)
        .then((res) => {
          token = res.body.data.token;
        });

      const response = await request(app.getHttpServer())
        .get(`/users/me/${token}`)
        .expect(200);

      expect(response.body).toStrictEqual({
        _links: {
          self: {
            href: expect.any(String),
          },
        },
        data: {
          id: expect.any(String),
          username: expect.any(String),
        },
      });
    });

    it('should return a 401 if the token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me/123')
        .expect(403);

      expect(response.body).toStrictEqual({
        statusCode: 403,
        message: expect.any(String),
        path: '/users/me/123',
      });
    });
  });
});
