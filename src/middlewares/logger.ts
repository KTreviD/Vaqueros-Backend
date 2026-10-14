import { NextFunction, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Axiom } from "@axiomhq/js";

const axiom = new Axiom({ token: process.env.AXIOM_TOKEN as string });

const getFormattedDate = () => {
  const now = new Date();
  const isoDate = now.toISOString().replace("T", " ").replace("Z", "");
  return `[${isoDate}]`;
};

const logEvents = async (requestData: any, user: any) => {
  const { method, origin, url, ip } = requestData;
  const date = getFormattedDate();
  const uuid = uuidv4();

  axiom.ingest(process.env.AXIOM_DATASET as string, [
    {
      date,
      method,
      origin,
      url,
      user,
      ip,
      uuid,
    },
  ]);
};

const getClientIp = (req: any) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    const ipList = forwardedFor.split(",");
    return ipList[0].trim();
  }
  return req.connection.remoteAddress;
};

export const logger = async (req: any, res: Response, next: NextFunction) => {
  const requestData = {
    method: req.method,
    origin: req.headers.origin,
    url: req.url,
    ip: getClientIp(req),
  };

  // const user = req?.user || "Anonymous";
  const user = {
    id: "87",
    email: "carloscharlie4td@hotmail.com",
    isEmailVerified: true,
    userPreferences:
      '{"enable2FA": false, "twoFactorSecret": null, "emailNotification": true}',
    createdAt: "2026-09-18 02:47:16.564",
    updatedAt: "2026-09-18 02:47:39.562",
    publicId: "b531be640776a60d0225b68cb",
  };

  await logEvents(requestData, user);
  next();
};
