import { evaluate } from "../src/evaluate.js";

function t(name: string, fn: () => void) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (e) {
    console.error(`fail - ${name}`);
    process.exitCode = 1;
  }
}

t("allows non-model-training actions", () => {
  const res = evaluate({ identityId: "user:123", action: "read", purpose: "social_connection" });
  if (!res.allowed) throw new Error("expected allowed");
});

t("denies model training by default", () => {
  const res = evaluate({ identityId: "user:123", action: "derive", purpose: "model_training" });
  if (res.allowed) throw new Error("expected denied");
});
