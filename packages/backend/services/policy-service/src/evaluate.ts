import { Request, Response } from "express";

type EvalRequest = {
  identityId: string;
  ruleId?: string;
  action: string;
  purpose?: string;
  context?: Record<string, unknown>;
};

type EvalResponse = {
  allowed: boolean;
  reasons: string[];
  obligations?: Record<string, unknown>;
};

// Very small deterministic evaluator for examples/prototyping
export function evaluate(req: EvalRequest): EvalResponse {
  // Example logic: if purpose is 'model_training' and derivative_creation is restricted, deny.
  // In a real implementation, fetch rule document and consent, then evaluate axes.
  if (req.purpose === "model_training") {
    return { allowed: false, reasons: ["model training not allowed by rule"] };
  }

  return { allowed: true, reasons: [] };
}

export function evaluateHandler(req: Request, res: Response) {
  const body = req.body as EvalRequest;
  const decision = evaluate(body);
  res.json({ success: true, data: decision, error: null, timestamp: new Date().toISOString() });
}
