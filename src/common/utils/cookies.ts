import { CookieOptions, Response } from "express";
import { JWT_EXPIRATIONS } from "../../config/jwt";
import { config } from "../../config/app.config";

type CookiePayloadType = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

const isProd = config.RAILWAY_ENVIRONMENT_NAME === "production";

const defaults: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: isProd ? "none" : "lax", // localhost puede usar lax
  domain: isProd ? ".alpha-so.com" : undefined,
};

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  maxAge: JWT_EXPIRATIONS.accessToken * 1000, // Miliseconds
  path: "/",
});

// En un futuro para aumentar la seguridad por si es que muchos hackers o no se
// Seria cambiar el path del refresh por un por ejemplo "/auth/refresh"
// Ya seria eso una logica mas compleja
// De momento igual ya tenemos buena seguridad

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  maxAge: JWT_EXPIRATIONS.refreshToken * 1000, // Miliseconds
  path: "/",
});

export const setAuthenticationCookies = ({
  res,
  accessToken,
  refreshToken,
}: CookiePayloadType): Response =>
  res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

export const clearAuthenticationCookies = (res: Response): Response =>
  res
    .clearCookie("accessToken", {
      path: "/",
      domain: defaults.domain,
    })
    .clearCookie("refreshToken", {
      path: "/",
      domain: defaults.domain,
    });
