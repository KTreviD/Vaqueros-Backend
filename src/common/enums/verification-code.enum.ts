enum VerificationEnum {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
  TWO_FACTOR_CODE = "TWO_FACTOR_CODE",
}

enum IsEmailVerificationCodeValidEnum {
  NOT_FOUND = "NOT_FOUND",
  EXPIRED = "EXPIRED",
  VALID = "VALID",
}

export { VerificationEnum, IsEmailVerificationCodeValidEnum };
