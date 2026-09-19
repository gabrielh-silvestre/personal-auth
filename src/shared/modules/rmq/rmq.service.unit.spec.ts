import type { ConfigService } from '@nestjs/config';

import { getRequiredEnv } from './rmq.service.js';

function fakeConfigService(values: Record<string, string>): ConfigService {
  return { get: (key: string) => values[key] } as ConfigService;
}

describe('Unit test RmqService env helpers', () => {
  it('should return the value when the variable is set', () => {
    const configService = fakeConfigService({ RABBITMQ_URL: 'amqp://x' });

    expect(getRequiredEnv(configService, 'RABBITMQ_URL')).toBe('amqp://x');
  });

  it('should throw naming the variable when RABBITMQ_URL is missing', () => {
    const configService = fakeConfigService({});

    expect(() => getRequiredEnv(configService, 'RABBITMQ_URL')).toThrow(
      'Missing required environment variable: RABBITMQ_URL',
    );
  });

  it('should throw naming the variable when a queue name is missing', () => {
    const configService = fakeConfigService({});

    expect(() => getRequiredEnv(configService, 'RABBITMQ_AUTH_QUEUE')).toThrow(
      'Missing required environment variable: RABBITMQ_AUTH_QUEUE',
    );
  });
});
