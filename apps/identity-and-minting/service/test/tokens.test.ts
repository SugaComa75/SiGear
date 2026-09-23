import { createAccessToken, verifyAccessToken } from "../src/tokens.js";

function t(name: string, fn: () => void) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`fail - ${name}`);
    process.exitCode = 1;
  }
}

t("embeds NTI claims in access token payload", () => {
  const token = createAccessToken({
    sub: "user-1",
    email: "parent@example.com",
    role: "parent",
    ntiIdentityId: "user-1",
    ntiAssuranceLevel: "verified"
  });

  const claims = verifyAccessToken(token);

  if (claims.ntiIdentityId !== "user-1") {
    throw new Error("expected ntiIdentityId claim to be present");
  }

  if (claims.ntiAssuranceLevel !== "verified") {
    throw new Error("expected ntiAssuranceLevel to be verified");
  }

  if (claims.type !== "access") {
    throw new Error("expected token type to be access");
  }
});
