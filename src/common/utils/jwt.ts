import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { User } from "../../database/models/user";
import { Session } from "../../database/models/session";
import { JWT_EXPIRATIONS, JWT_SECRETS } from "../../config/jwt";

export type AccessTPayload = {
  userId: User["id"];
  sessionId: Session["id"];
};

export type RefreshTPayload = {
  sessionId: Session["id"];
};

type SignOptsAndSecret = SignOptions & {
  secret: string;
};

const defaults: SignOptions = {
  audience: ["user"],
};

export const accessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: JWT_EXPIRATIONS.accessToken,
  secret: JWT_SECRETS.accessToken,
};

export const refreshTokenSignOptions: SignOptsAndSecret = {
  expiresIn: JWT_EXPIRATIONS.refreshToken,
  secret: JWT_SECRETS.refreshToken,
};

export const signJwtToken = (
  payload: AccessTPayload | RefreshTPayload,
  options?: SignOptsAndSecret
) => {
  const { secret, ...opts } = options || accessTokenSignOptions;

  return jwt.sign(payload, secret, {
    ...defaults,
    ...opts,
  });
};

export const verifyJwtToken = <TPayload extends object = AccessTPayload>(
  token: string,
  options?: VerifyOptions & { secret: string }
) => {
  try {
    const { secret = JWT_EXPIRATIONS.accessToken, ...opts } = options || {};
    // @ts-ignore
    const payload = jwt.verify(token, secret, {
      ...defaults,
      ...opts,
    }) as unknown as TPayload;
    return { payload };
  } catch (err: any) {
    return {
      error: err.message,
    };
  }
};
