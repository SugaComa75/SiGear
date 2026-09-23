import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 3003);

app.get("/health", (_request, response) => {
  response.json({
    service: process.env.SERVICE_NAME ?? "sync-service",
    status: "ok",
    phase: "phase-zero",
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`sync-service listening on ${port}`);
});