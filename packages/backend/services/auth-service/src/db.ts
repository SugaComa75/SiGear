import { Pool } from "pg";

import { config } from "./config.js";

export const pool = new Pool({
  connectionString: config.databaseUrl
});

export type UserRecord = {
  id: string;
  email: string;
  role: "parent" | "child" | "admin" | "moderator";
  password_hash: string | null;
  status: string;
};

export const findUserByEmail = async (email: string): Promise<UserRecord | null> => {
  const result = await pool.query<UserRecord>(
    `
      SELECT id, email, role, password_hash, status
      FROM users
      WHERE email = $1
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
};

export const storeRefreshToken = async (
  userId: string,
  tokenHash: string,
  expiresAt: Date,
  createdByIp?: string,
  userAgent?: string
): Promise<void> => {
  await pool.query(
    `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_by_ip, user_agent)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [userId, tokenHash, expiresAt.toISOString(), createdByIp ?? null, userAgent ?? null]
  );
};

export const revokeRefreshToken = async (tokenHash: string): Promise<boolean> => {
  const result = await pool.query(
    `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE token_hash = $1
        AND revoked_at IS NULL
      RETURNING id
    `,
    [tokenHash]
  );

  return (result.rowCount ?? 0) > 0;
};

export const getActiveRefreshToken = async (tokenHash: string): Promise<{ user_id: string; expires_at: Date } | null> => {
  const result = await pool.query<{ user_id: string; expires_at: Date }>(
    `
      SELECT user_id, expires_at
      FROM refresh_tokens
      WHERE token_hash = $1
        AND revoked_at IS NULL
      LIMIT 1
    `,
    [tokenHash]
  );

  return result.rows[0] ?? null;
};

export const registerDeviceBootstrap = async (
  bootstrapId: string,
  deviceType: string,
  deviceName: string
): Promise<{ id: string; bootstrap_status: string }> => {
  const result = await pool.query<{ id: string; bootstrap_status: string }>(
    `
      INSERT INTO devices (device_type, device_name, bootstrap_id, bootstrap_status)
      VALUES ($1, $2, $3, 'registered')
      ON CONFLICT (bootstrap_id) DO UPDATE
      SET device_type = EXCLUDED.device_type,
          device_name = EXCLUDED.device_name,
          bootstrap_status = 'registered',
          updated_at = NOW()
      RETURNING id, bootstrap_status
    `,
    [deviceType, deviceName, bootstrapId]
  );

  return result.rows[0];
};