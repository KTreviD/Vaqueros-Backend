import { getEnv } from "../common/utils/get_env";

const appConfig = () => ({
  RAILWAY_ENVIRONMENT_NAME: getEnv("RAILWAY_ENVIRONMENT_NAME"),
  PORT: getEnv("PORT"),
  JWT: {
    ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
    REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),

    ACCESS_EXPIRES: getEnv("JWT_ACCESS_EXPIRES"),
    REFRESH_EXPIRES: getEnv("JWT_REFRESH_EXPIRES"),
  },
  S3_FILES: {
    AWS_ACCESS_KEY_ID: getEnv("AWS_ACCESS_KEY_ID"),
    AWS_SECRET_ACCESS_KEY: getEnv("AWS_SECRET_ACCESS_KEY"),
    AWS_REGION: getEnv("AWS_REGION"),
    S3_BUCKET_NAME: getEnv("S3_BUCKET_NAME"),
  },
  MAILER_SENDER: getEnv("MAILER_SENDER"),
  RESEND_API_KEY: getEnv("RESEND_API_KEY"),
  FRONT_API: getEnv("FRONT_API"),
});

export const config = appConfig();
