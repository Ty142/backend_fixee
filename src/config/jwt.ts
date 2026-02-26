const getEnvOrDefault = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

export const JWT_CONFIG = {
  SECRET: getEnvOrDefault('JWT_SECRET', 'default-secret-change-in-production'),
  REFRESH_SECRET: getEnvOrDefault('JWT_REFRESH_SECRET', 'default-refresh-secret-change-in-production'),
  ACCESS_TOKEN_EXPIRES_IN: getEnvOrDefault('JWT_ACCESS_EXPIRES_IN', '1h'),
  REFRESH_TOKEN_EXPIRES_IN: getEnvOrDefault('JWT_REFRESH_EXPIRES_IN', '7d'),
};
