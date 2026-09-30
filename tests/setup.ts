process.env.NODE_ENV = "test";
process.env.RAILWAY_ENVIRONMENT_NAME = "test";

process.env.PORT = "8000";

process.env.DATABASE_PUBLIC_URL = "postgresql://test:test@localhost:5432/test";

process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";

process.env.JWT_ACCESS_EXPIRES = "3600";
process.env.JWT_REFRESH_EXPIRES = "604800";

process.env.RESEND_API_KEY = "test-resend-key";
process.env.MAILER_SENDER = "test@example.com";
process.env.FRONT_API = "http://localhost:3000";

process.env.AWS_SECRET_ACCESS_KEY = "test";
process.env.AWS_ACCESS_KEY_ID = "test";
process.env.AWS_REGION = "us-east-1";
process.env.S3_BUCKET_NAME = "test-bucket";
