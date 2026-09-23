import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";

import { config } from "./config.js";
import {
  findUserByEmail,
  getActiveRefreshToken,
  pool,
  registerDeviceBootstrap,
  revokeRefreshToken,
  storeRefreshToken
} from "./db.js";
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  verifyAccessToken,
  verifyRefreshToken
} from "./tokens.js";
import { deviceRegistrationSchema, loginSchema, refreshSchema } from "./validation.js";

const app = express();

app.use(express.json());

const unauthorized = (response: express.Response, message = "Invalid credentials") => {
  response.status(401).json({
    success: false,
    data: null,
    error: {
      code: "AUTH_INVALID_CREDENTIALS",
      message
    },
    timestamp: new Date().toISOString()
  });
};

app.get("/health", async (_request, response) => {
  try {
    await pool.query("SELECT 1");

    response.json({
      success: true,
      data: {
        service: config.serviceName,
        status: "ok",
        phase: "phase-one",
        database: "reachable"
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    response.status(503).json({
      success: false,
      data: null,
      error: {
        code: "SERVICE_UNHEALTHY",
        message: error instanceof Error ? error.message : "Database unavailable"
      },
      timestamp: new Date().toISOString()
    });
  }
});

app.post("/auth/login", async (request, response, next) => {
  try {
    const input = loginSchema.parse(request.body);
    const user = await findUserByEmail(input.email.toLowerCase());

    if (!user || !user.password_hash || user.status !== "active") {
      return unauthorized(response);
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password_hash);

    if (!passwordMatches) {
      return unauthorized(response);
    }

    const accessToken = createAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      ntiIdentityId: user.id,
      ntiAssuranceLevel: "verified"
    });
    const refreshToken = createRefreshToken(user.id);
    const refreshTokenHash = hashToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + config.refreshTokenTtlSeconds * 1000);

    await storeRefreshToken(
      user.id,
      refreshTokenHash,
      refreshExpiresAt,
      request.ip,
      request.get("user-agent")
    );

    response.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: config.accessTokenTtlSeconds,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/token/verify", (request, response, next) => {
  try {
    const authorizationHeader = request.get("authorization");
    const token = authorizationHeader?.startsWith("Bearer ") ? authorizationHeader.slice(7) : null;

    if (!token) {
      return unauthorized(response, "Missing bearer token");
    }

    const claims = verifyAccessToken(token);

    response.status(200).json({
      success: true,
      data: {
        valid: true,
        subject: claims.sub,
        email: claims.email,
        role: claims.role,
        ntiIdentityId: claims.ntiIdentityId,
        ntiAssuranceLevel: claims.ntiAssuranceLevel,
        permissions: claims.permissions,
        tokenType: claims.type
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/token/refresh", async (request, response, next) => {
  try {
    const input = refreshSchema.parse(request.body);
    const claims = verifyRefreshToken(input.refreshToken);
    const hashedToken = hashToken(input.refreshToken);
    const storedToken = await getActiveRefreshToken(hashedToken);

    if (!storedToken || storedToken.user_id !== claims.sub || new Date(storedToken.expires_at) <= new Date()) {
      return unauthorized(response, "Refresh token is invalid or expired");
    }

    const userResult = await pool.query<{ id: string; email: string; role: "parent" | "child" | "admin" | "moderator" }>(
      `
        SELECT id, email, role
        FROM users
        WHERE id = $1
          AND deleted_at IS NULL
          AND status = 'active'
        LIMIT 1
      `,
      [claims.sub]
    );

    const user = userResult.rows[0];

    if (!user) {
      return unauthorized(response, "Refresh token subject is no longer active");
    }

    await revokeRefreshToken(hashedToken);

    const accessToken = createAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      ntiIdentityId: user.id,
      ntiAssuranceLevel: "verified"
    });
    const refreshToken = createRefreshToken(user.id);
    const refreshTokenHash = hashToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + config.refreshTokenTtlSeconds * 1000);

    await storeRefreshToken(user.id, refreshTokenHash, refreshExpiresAt, request.ip, request.get("user-agent"));

    response.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: config.accessTokenTtlSeconds,
        user
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/logout", async (request, response, next) => {
  try {
    const input = refreshSchema.parse(request.body);
    const revoked = await revokeRefreshToken(hashToken(input.refreshToken));

    response.status(revoked ? 200 : 404).json({
      success: revoked,
      data: revoked ? { revoked: true } : null,
      error: revoked
        ? null
        : {
            code: "AUTH_REFRESH_TOKEN_NOT_FOUND",
            message: "Refresh token not found or already revoked"
          },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/device/register", async (request, response, next) => {
  try {
    const input = deviceRegistrationSchema.parse(request.body);
    const device = await registerDeviceBootstrap(input.bootstrapId, input.deviceType, input.deviceName);

    response.status(201).json({
      success: true,
      data: {
        deviceId: device.id,
        bootstrapStatus: device.bootstrap_status
      },
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    return response.status(400).json({
      success: false,
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: error.flatten()
      },
      timestamp: new Date().toISOString()
    });
  }

  if (error instanceof jwt.JsonWebTokenError) {
    return response.status(401).json({
      success: false,
      data: null,
      error: {
        code: "AUTH_INVALID_TOKEN",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }

  return response.status(500).json({
    success: false,
    data: null,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "Unexpected server error"
    },
    timestamp: new Date().toISOString()
  });
});

app.listen(config.port, () => {
  console.log(`${config.serviceName} listening on ${config.port}`);
});