export interface VerifyMFAForLoginDto {
  code: string;
  email: string;
  ip: string;
  userAgent: string;
}
