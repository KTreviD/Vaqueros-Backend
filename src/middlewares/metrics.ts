import client from "prom-client";
import { Request, Response, NextFunction } from "express";

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
});

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
});

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

const httpRequestSize = new client.Histogram({
  name: "http_request_size_bytes",
  help: "HTTP request size in bytes",
  labelNames: ["method", "route"] as const,
  buckets: [100, 500, 1000, 5000, 10000, 50000, 100000, 500000],
});

const httpResponseSize = new client.Histogram({
  name: "http_response_size_bytes",
  help: "HTTP response size in bytes",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [100, 500, 1000, 5000, 10000, 50000, 100000, 500000],
});

const activeRequests = new client.Gauge({
  name: "http_active_requests",
  help: "Number of HTTP requests currently being processed",
});

register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestSize);
register.registerMetric(httpResponseSize);
register.registerMetric(activeRequests);

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.path === "/metrics") {
    return next();
  }

  const start = process.hrtime.bigint();

  activeRequests.inc();

  let finished = false;

  const finishRequest = () => {
    if (finished) return;
    finished = true;

    activeRequests.dec();

    const end = process.hrtime.bigint();

    const duration = Number(end - start) / 1_000_000_000;

    const routePath = req.route?.path ?? req.path ?? "unknown";

    const route =
      req.baseUrl && routePath !== "/"
        ? `${req.baseUrl}${routePath}`
        : req.baseUrl || routePath;

    const method = req.method;
    const statusCode = res.statusCode.toString();

    httpRequestCounter.inc({
      method,
      route,
      status_code: statusCode,
    });

    httpRequestDuration.observe(
      {
        method,
        route,
        status_code: statusCode,
      },
      duration
    );

    const requestLength = Number(req.headers["content-length"]) || 0;

    httpRequestSize.observe(
      {
        method,
        route,
      },
      requestLength
    );

    const responseLength = Number(res.getHeader("content-length")) || 0;

    httpResponseSize.observe(
      {
        method,
        route,
        status_code: statusCode,
      },
      responseLength
    );
  };

  res.on("finish", finishRequest);
  res.on("close", finishRequest);

  next();
};

export const metricsHandler = async (_req: Request, res: Response) => {
  res.setHeader("Content-Type", register.contentType);

  res.send(await register.metrics());
};
