const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 3001),
  serviceName: process.env.SERVICE_NAME ?? "auth-service",
  databaseUrl: required("DATABASE_URL", "postgresql://sigear:sigear_dev_password@localhost:5432/sigear_dev"),
  accessTokenSecret: required("JWT_ACCESS_SECRET", "change-me-access-secret"),
  refreshTokenSecret: required("JWT_REFRESH_SECRET", "change-me-refresh-secret"),
  accessTokenTtlSeconds: Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? 900),
  refreshTokenTtlSeconds: Number(process.env.REFRESH_TOKEN_TTL_SECONDS ?? 604800)
};