import geoip from "geoip-lite";
const UAParser = require("ua-parser-js");
import crypto from "crypto";

export const generateNumericCode = (length = 6): string => {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;

  return crypto.randomInt(min, max + 1).toString();
};

export const getClientIp = (req: any): string => {
  let ip: string | undefined;

  // 1️⃣ Revisar cabeceras típicas de proxies / serverless
  const forwardedFor = req.headers["x-forwarded-for"] as string;
  const realIp = req.headers["x-real-ip"] as string;
  const cfIp = req.headers["cf-connecting-ip"] as string; // Cloudflare

  if (forwardedFor) {
    // Puede venir una lista de IPs: "clientIP, proxy1, proxy2"
    ip = forwardedFor.split(",")[0].trim();
  } else if (realIp) {
    ip = realIp;
  } else if (cfIp) {
    ip = cfIp;
  } else if (req.connection?.remoteAddress) {
    ip = req.connection.remoteAddress;
  } else if (req.socket?.remoteAddress) {
    ip = req.socket.remoteAddress;
  } else if (req.connection?.socket?.remoteAddress) {
    ip = req.connection.socket.remoteAddress;
  }

  if (!ip) return "Unknown";

  // 2️⃣ Normalizar IPv6 mapeada a IPv4 (::ffff:127.0.0.1 → 127.0.0.1)
  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  if (ip === "::1") {
    ip = "127.0.0.1";
  }

  return ip;
};

export const getDataFromIp = (ip: string, userAgent: string | undefined) => {
  const geo = geoip.lookup(ip);

  const city = geo?.city || "Unknown";
  const country = geo?.country || "Unknown";

  const parser = new UAParser(userAgent);

  const uaResult = parser.getResult();

  const deviceName = uaResult.device.model
    ? uaResult.device.model
    : uaResult.browser.name;
  const osName = uaResult.os.name;
  const deviceType = uaResult.device.type || "desktop";

  return { city, country, deviceName, osName, deviceType };
};

export const DUMMY_HASH =
  "$2a$12$vqjGpGd5g23DAe6Yz9nXDOh98lV6Cg/W3t8G5a7C2PbfgHkZw49Oa";
