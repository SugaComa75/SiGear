import crypto from "node:crypto";

import jwt from "jsonwebtoken";

import { config } from "./config.js";

export type AuthRole = "parent" | "child" | "admin" | "moderator";

export type AccessTokenClaims = {
  sub: string;
  email: string;
  role: AuthRole;
  ntiIdentityId: string;
  ntiAssuranceLevel: "base" | "verified";
  permissions: string[];
  type: "access";
};

export type RefreshTokenClaims = {
  sub: string;
  type: "refresh";
};

const basePermissionsByRole: Record<AuthRole, string[]> = {
  parent: ["identity:read", "identity:write", "policy:read", "policy:write"],
  child: ["identity:read:self", "session:read:self"],
  admin: ["*"] ,
  moderator: ["moderation:read", "moderation:write"]
};

export const permissionsForRole = (role: AuthRole): string[] => basePermissionsByRole[role];

export const createAccessToken = (claims: Omit<AccessTokenClaims, "type" | "permissions"> & { role: AuthRole }): string => {
  const payload: AccessTokenClaims = {
    ...claims,
    type: "access",
    permissions: permissionsForRole(claims.role)
  };

  return jwt.sign(payload, config.accessTokenSecret, {
    algorithm: "HS256",
    expiresIn: config.accessTokenTtlSeconds,
    issuer: "sigear-auth",
    audience: "sigear-clients"
  });
};

export const createRefreshToken = (userId: string): string => {
  const payload: RefreshTokenClaims = {
    sub: userId,
    type: "refresh"
  };

  return jwt.sign(payload, config.refreshTokenSecret, {
    algorithm: "HS256",
    expiresIn: config.refreshTokenTtlSeconds,
    issuer: "sigear-auth",
    audience: "sigear-clients"
  });
};

export const verifyAccessToken = (token: string): AccessTokenClaims => {
  return jwt.verify(token, config.accessTokenSecret, {
    algorithms: ["HS256"],
    issuer: "sigear-auth",
    audience: "sigear-clients"
  }) as AccessTokenClaims;
};

export const verifyRefreshToken = (token: string): RefreshTokenClaims => {
  return jwt.verify(token, config.refreshTokenSecret, {
    algorithms: ["HS256"],
    issuer: "sigear-auth",
    audience: "sigear-clients"
  }) as RefreshTokenClaims;
};

export const hashToken = (token: string): string => crypto.createHash("sha256").update(token).digest("hex");