import { config } from "../config/app.config";

export const JWT_EXPIRATIONS = {
  accessToken: Number(config.JWT.ACCESS_EXPIRES), // Seconds
  refreshToken: Number(config.JWT.REFRESH_EXPIRES), // Seconds
};

export const JWT_SECRETS = {
  accessToken: config.JWT.ACCESS_SECRET,
  refreshToken: config.JWT.REFRESH_SECRET,
};
