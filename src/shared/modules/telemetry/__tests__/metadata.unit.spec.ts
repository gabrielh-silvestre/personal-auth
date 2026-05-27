import { TELEMETRY_TOKEN_TYPE_KEY, TelemetryTokenType } from '../metadata';

describe('TelemetryTokenType decorator', () => {
  describe('TELEMETRY_TOKEN_TYPE_KEY', () => {
    it('is defined and equals the expected string', () => {
      expect(TELEMETRY_TOKEN_TYPE_KEY).toBe('telemetry:tokenType');
    });
  });

  describe('when applied to a method', () => {
    it('writes "access" under TELEMETRY_TOKEN_TYPE_KEY', () => {
      class Target {
        @TelemetryTokenType('access')
        method() {}
      }

      const value = Reflect.getMetadata(
        TELEMETRY_TOKEN_TYPE_KEY,
        Target.prototype.method,
      );
      expect(value).toBe('access');
    });

    it('writes "refresh" under TELEMETRY_TOKEN_TYPE_KEY', () => {
      class Target {
        @TelemetryTokenType('refresh')
        method() {}
      }

      const value = Reflect.getMetadata(
        TELEMETRY_TOKEN_TYPE_KEY,
        Target.prototype.method,
      );
      expect(value).toBe('refresh');
    });

    it('writes "recover" under TELEMETRY_TOKEN_TYPE_KEY', () => {
      class Target {
        @TelemetryTokenType('recover')
        method() {}
      }

      const value = Reflect.getMetadata(
        TELEMETRY_TOKEN_TYPE_KEY,
        Target.prototype.method,
      );
      expect(value).toBe('recover');
    });

    it('does not write metadata on a different method of the same class', () => {
      class Target {
        @TelemetryTokenType('access')
        decorated() {}

        undecorated() {}
      }

      const value = Reflect.getMetadata(
        TELEMETRY_TOKEN_TYPE_KEY,
        Target.prototype.undecorated,
      );
      expect(value).toBeUndefined();
    });

    it('overwrites the value when the decorator is applied twice', () => {
      class Target {
        @TelemetryTokenType('refresh')
        @TelemetryTokenType('access')
        method() {}
      }

      // Decorators are applied bottom-up, so 'refresh' is the outermost call
      const value = Reflect.getMetadata(
        TELEMETRY_TOKEN_TYPE_KEY,
        Target.prototype.method,
      );
      expect(value).toBe('refresh');
    });
  });
});
