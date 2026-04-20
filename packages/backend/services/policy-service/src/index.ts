import express from "express";
import bodyParser from "body-parser";
import { evaluateHandler } from "./evaluate.js";

const app = express();
const port = Number(process.env.PORT ?? 3002);

app.get("/health", (_request, response) => {
  response.json({
    service: process.env.SERVICE_NAME ?? "policy-service",
    status: "ok",
    phase: "phase-zero",
    timestamp: new Date().toISOString()
  });
});

app.post("/v1/evaluate", bodyParser.json(), evaluateHandler);

app.listen(port, () => {
  console.log(`policy-service listening on ${port}`);
});