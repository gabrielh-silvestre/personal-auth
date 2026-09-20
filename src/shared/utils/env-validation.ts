export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const required = [
    'JWT_ACCESS_TOKEN_SECRET',
    'JWT_ACCESS_TOKEN_EXPIRES_IN',
    'JWT_REFRESH_TOKEN_SECRET',
    'JWT_REFRESH_TOKEN_EXPIRES_IN',
  ];

  const missing = required.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }

  if (config.JWT_ACCESS_TOKEN_SECRET === config.JWT_REFRESH_TOKEN_SECRET) {
    throw new Error(
      'JWT_ACCESS_TOKEN_SECRET and JWT_REFRESH_TOKEN_SECRET must be different',
    );
  }

  return config;
}
