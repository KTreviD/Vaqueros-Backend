import { S3Client } from "@aws-sdk/client-s3";
import { config } from "./app.config";

export const s3 = new S3Client({
  region: config.S3_FILES.AWS_REGION,
  credentials: {
    accessKeyId: config.S3_FILES.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.S3_FILES.AWS_SECRET_ACCESS_KEY,
  },
});
