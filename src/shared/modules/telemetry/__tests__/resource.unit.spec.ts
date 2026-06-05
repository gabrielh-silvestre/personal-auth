import { loadTelemetryEnv } from '../env';
import { buildResource } from '../resource';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('buildResource', () => {
  const env = loadTelemetryEnv({
    OTEL_SERVICE_NAME: 'personal-auth-test',
    OTEL_SERVICE_VERSION: '9.9.9',
    NODE_ENV: 'test',
  });

  it('exposes all required attribute keys', () => {
    const resource = buildResource(env);
    const attrs = resource.attributes;

    expect(attrs['service.name']).toBe('personal-auth-test');
    expect(attrs['service.version']).toBe('9.9.9');
    expect(typeof attrs['service.instance.id']).toBe('string');
    expect(attrs['deployment.environment.name']).toBe('test');
    expect(typeof attrs['host.name']).toBe('string');
    expect((attrs['host.name'] as string).length).toBeGreaterThan(0);
  });

  it('uses a UUID v4 for service.instance.id', () => {
    const resource = buildResource(env);
    expect(resource.attributes['service.instance.id']).toMatch(UUID_V4);
  });

  it('keeps service.instance.id stable across multiple calls within the same module load', () => {
    const a = buildResource(env);
    const b = buildResource(env);
    expect(a.attributes['service.instance.id']).toBe(
      b.attributes['service.instance.id'],
    );
  });
});
