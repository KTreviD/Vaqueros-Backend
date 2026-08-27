import { ErrorCode } from "../../common/enums/error-code.enum";
import {
  IsEmailVerificationCodeValidEnum,
  VerificationEnum,
} from "../../common/enums/verification-code.enum";
import {
  IsVerificationCodeValidResult,
  LoginDto,
  RegisterDto,
  resetPasswordDto,
  VerifyEmailDto,
} from "../../common/interface/auth.interface";
import {
  BadRequestException,
  HttpException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/utils/catch-errors";
import {
  anHourFromNow,
  calculateExpirationDate,
  fiveMinutesFromNow,
  fortyFiveMinutesFromNow,
  ONE_DAY_IN_MS,
  threeMinutesAgo,
} from "../../common/utils/date_time";
import { config } from "../../config/app.config";
import {
  refreshTokenSignOptions,
  RefreshTPayload,
  signJwtToken,
  verifyJwtToken,
} from "../../common/utils/jwt";
import { sendEmail } from "../../mailers/mailer";
import {
  passwordResetTemplate,
  sendMFATwoFactorCodeTemplate,
  verifyEmailTemplate,
} from "../../mailers/templates/template";
import { HTTPSTATUS } from "../../config/http.config";
import { compareValue, hashValue } from "../../common/utils/bcrypt";
import { logger } from "../../common/utils/logger";
import { Session } from "../../database/models/session";
import { User } from "../../database/models/user";
import { VerificationCode } from "../../database/models/verification";
import { Op } from "sequelize";
import { DUMMY_HASH, generateNumericCode, getDataFromIp } from "./utils";
import { JWT_EXPIRATIONS } from "../../config/jwt";
import {
  AuthResponse,
  AuthResult,
  SessionResponseDto,
  UserResponseDto,
} from "./dto";
import { generateUniqueCode } from "../../common/utils/cryptoUniqueCode";
import { createHash } from "crypto";

export class AuthService {
  public async register(registerData: RegisterDto) {
    const { email, password } = registerData;

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      throw new BadRequestException(
        "User already exists with this email",
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
      );
    }

    const newUser = await User.create({
      email,
      password,
    });

    const rawCode = generateUniqueCode();
    const hashedCode = await hashValue(rawCode);
    const lookupKey = createHash("sha256").update(rawCode).digest("hex");

    await VerificationCode.create({
      userId: newUser.id,
      code: hashedCode,
      lookupKey,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: fortyFiveMinutesFromNow(),
    });

    // Sending verification email link
    const verificationUrl = `${config.FRONT_API}/auth/confirm-account?code=${rawCode}`;
    await sendEmail({
      to: newUser.email,
      ...verifyEmailTemplate(verificationUrl),
    });
  }

  public async login(loginData: LoginDto): Promise<AuthResult> {
    const { email, password, userAgent, ip } = loginData;

    logger.info(`Login attempt for email: ${email}`);

    const user = await User.findOne({
      where: { email },
    });

    const passwordHash = user?.password ?? DUMMY_HASH;
    const isPasswordValid = await compareValue(password, passwordHash);

    // Esto se hace asi para evitar un user Enumeration by Message and Timing
    if (!user || !isPasswordValid) {
      logger.warn(
        `Login failed for email: ${email}, userId: ${user ? user.id : null}`
      );
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_INVALID_CREDENTIALS
      );
    }

    if (!user?.is_email_verified)
      throw new BadRequestException(
        "This email is not verified",
        ErrorCode.AUTH_USER_NOT_VERIFIED
      );

    if (user?.userPreferences?.enable2FA) {
      const rawCode = generateNumericCode(6);
      const hashedCode = await hashValue(rawCode);
      const lookupKey = createHash("sha256").update(rawCode).digest("hex");

      await sendEmail({
        to: email,
        ...sendMFATwoFactorCodeTemplate(rawCode),
      });

      await VerificationCode.destroy({
        where: {
          userId: user?.id,
          type: VerificationEnum.TWO_FACTOR_CODE,
        },
      });

      await VerificationCode.create({
        userId: user?.id,
        code: hashedCode,
        lookupKey,
        type: VerificationEnum.TWO_FACTOR_CODE,
        expiresAt: fiveMinutesFromNow(),
      });

      logger.info(`2FA required for user ID: ${user.id}`);

      return AuthResponse.mfaRequired();
    }

    logger.info(`Creating session for user ID: ${user.id}`);

    const dataFromIp = getDataFromIp(ip, userAgent);

    const session = await Session.create({
      userId: user.id,
      userAgent: userAgent || "",
      ip,
      ...dataFromIp,
      expiredAt: calculateExpirationDate(JWT_EXPIRATIONS.refreshToken),
    });

    logger.info(`Signing tokens for user ID: ${user.id}`);
    const accessToken = signJwtToken({
      userId: user.id,
      sessionId: session.id,
    });

    const refreshToken = signJwtToken(
      {
        sessionId: session.id,
      },
      refreshTokenSignOptions
    );

    logger.info(`Login successful for user ID: ${user.id}`);
    const userDto = new UserResponseDto(user);
    const sessionDto = new SessionResponseDto(session);

    return AuthResponse.success({
      user: userDto,
      session: sessionDto,
      accessToken,
      refreshToken,
    });
  }

  // TODO Falta que este en el user
  public async refreshToken(refreshToken: string) {
    const { payload } = verifyJwtToken<RefreshTPayload>(refreshToken, {
      secret: refreshTokenSignOptions.secret,
    });

    if (!payload) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const session = await Session.findByPk(payload.sessionId);
    const now = Date.now();

    if (!session) {
      throw new UnauthorizedException("Session does not exist");
    }

    if (session.expiredAt.getTime() <= now) {
      throw new UnauthorizedException("Session expired");
    }

    const sessionRequireRefresh =
      session.expiredAt.getTime() - now <= ONE_DAY_IN_MS;

    if (sessionRequireRefresh) {
      session.expiredAt = calculateExpirationDate(JWT_EXPIRATIONS.refreshToken);
      await session.save();
    }

    const newRefreshToken = sessionRequireRefresh
      ? signJwtToken(
          {
            sessionId: session.id,
          },
          refreshTokenSignOptions
        )
      : undefined;

    const accessToken = signJwtToken({
      userId: session.userId,
      sessionId: session.id,
    });

    return {
      accessToken,
      newRefreshToken,
    };
  }

  public async verifyEmail(verifyEmailData: VerifyEmailDto) {
    const { code, userAgent, ip } = verifyEmailData;

    const lookupKey = createHash("sha256").update(code).digest("hex");

    const verificationCode = await VerificationCode.findOne({
      where: {
        lookupKey,
        type: VerificationEnum.EMAIL_VERIFICATION,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!verificationCode) {
      throw new BadRequestException("Invalid or expired verification code");
    }

    const isMatch = await compareValue(code, verificationCode.code);

    if (!isMatch) {
      throw new BadRequestException("Invalid or expired verification code");
    }

    // 2️⃣ Buscar usuario por ID
    const user = await User.findByPk(verificationCode.userId);
    if (!user) {
      throw new BadRequestException(
        "Unable to verify email address",
        ErrorCode.VALIDATION_ERROR
      );
    }

    // 3️⃣ Validar si ya estaba verificado (CHEQUEO EXTRA)
    if (user.is_email_verified === true) {
      await verificationCode.destroy();

      throw new BadRequestException(
        "Email is already verified",
        ErrorCode.VALIDATION_ERROR
      );
    }

    // 4️⃣ Marcar como verificado y guardar
    user.is_email_verified = true;
    await user.save();

    // 5️⃣ Eliminar el código de verificación
    await verificationCode.destroy();

    const dataFromIp = getDataFromIp(ip, userAgent);

    // 6️⃣ Crear sesión y tokens (igual que login)
    const session = await Session.create({
      userId: user.id,
      userAgent: userAgent || "",
      ip,
      ...dataFromIp,
      expiredAt: calculateExpirationDate(JWT_EXPIRATIONS.refreshToken),
    });

    const accessToken = signJwtToken({
      userId: user.id,
      sessionId: session.id,
    });

    const refreshToken = signJwtToken(
      {
        sessionId: session.id,
      },
      refreshTokenSignOptions
    );

    const userDto = new UserResponseDto(user);
    const sessionDto = new SessionResponseDto(session);

    return AuthResponse.success({
      user: userDto,
      session: sessionDto,
      accessToken,
      refreshToken,
    });
  }

  public async isEmailVerificationCodeValid(
    code: string,
    type: VerificationEnum
  ): Promise<IsVerificationCodeValidResult> {
    const lookupKey = createHash("sha256").update(code).digest("hex");

    // 1️⃣ Buscar por código (no filtramos por expiresAt todavía)
    const verification = await VerificationCode.findOne({
      where: {
        lookupKey,
        type,
      },
    });

    // 2️⃣ No existe (ya usado o nunca creado)
    if (!verification) {
      return {
        status: IsEmailVerificationCodeValidEnum.NOT_FOUND,
        message: "Verification code not found or already used",
      };
    }

    const isMatch = await compareValue(code, verification.code);

    if (!isMatch) {
      return {
        status: IsEmailVerificationCodeValidEnum.NOT_FOUND,
        message: "Verification code not found or already used",
      };
    }

    // 3️⃣ Existe pero está expirado
    if (verification.expiresAt < new Date()) {
      const user = await User.findOne({
        where: { id: verification.userId },
      });

      return {
        userId: user!.id,
        status: IsEmailVerificationCodeValidEnum.EXPIRED,
        message: "Verification code has expired",
      };
    }

    // 4️⃣ Es válido
    return {
      status: IsEmailVerificationCodeValidEnum.VALID,
      message: "Verification code is valid",
    };
  }

  public async resendVerificationEmail(userId: number, type: VerificationEnum) {
    const user = await User.findOne({
      where: { id: userId },
    });

    await VerificationCode.destroy({
      where: {
        userId,
        type,
      },
    });

    const rawCode = generateUniqueCode();
    const hashedCode = await hashValue(rawCode);
    const lookupKey = createHash("sha256").update(rawCode).digest("hex");

    await VerificationCode.create({
      userId,
      code: hashedCode,
      lookupKey,
      type,
      expiresAt: fortyFiveMinutesFromNow(),
    });

    let linkPart = "";

    switch (type) {
      case VerificationEnum.EMAIL_VERIFICATION:
        linkPart = "confirm-account";
        break;
      case VerificationEnum.PASSWORD_RESET:
        linkPart = "reset-password";
        break;
      // case VerificationEnum.TWO_FACTOR_CODE:
      // break;
    }

    // Sending verification email link
    const verificationUrl = `${config.FRONT_API}/auth/${linkPart}?code=${rawCode}`;
    await sendEmail({
      to: user!.email,
      ...verifyEmailTemplate(verificationUrl),
    });
  }

  public async forgotPassword(email: string) {
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await VerificationCode.destroy({
      where: {
        userId: user.id,
        type: VerificationEnum.PASSWORD_RESET,
      },
    });

    const rawCode = generateUniqueCode();
    const hashedCode = await hashValue(rawCode);
    const lookupKey = createHash("sha256").update(rawCode).digest("hex");

    await VerificationCode.create({
      userId: user.id,
      code: hashedCode,
      lookupKey,
      type: VerificationEnum.PASSWORD_RESET,
      expiresAt: fortyFiveMinutesFromNow(),
    });

    const resetLink = `${config.FRONT_API}/auth/reset-password?code=${rawCode}`;

    const { data, error } = await sendEmail({
      to: user.email,
      ...passwordResetTemplate(resetLink),
    });

    if (!data?.id) {
      throw new InternalServerException(`${error?.name} ${error?.message}`);
    }

    return {
      url: resetLink,
      emailId: data.id,
    };
  }

  public async resetPassword({ code, password }: resetPasswordDto) {
    const lookupKey = createHash("sha256").update(code).digest("hex");

    // Buscar código de verificación válido
    const verificationCode = await VerificationCode.findOne({
      where: {
        lookupKey,
        type: VerificationEnum.PASSWORD_RESET,
      },
    });

    // 2️⃣ No existe (ya usado o nunca creado)
    if (!verificationCode) {
      return {
        status: IsEmailVerificationCodeValidEnum.NOT_FOUND,
        message: "Verification code not found or already used",
      };
    }

    const isMatch = await compareValue(code, verificationCode.code);

    if (!isMatch) {
      return {
        status: IsEmailVerificationCodeValidEnum.NOT_FOUND,
        message: "Verification code not found or already used",
      };
    }

    // 3️⃣ Existe pero está expirado
    if (verificationCode.expiresAt < new Date()) {
      const user = await User.findOne({
        where: { id: verificationCode.userId },
      });

      return {
        userId: user!.id,
        status: IsEmailVerificationCodeValidEnum.EXPIRED,
        message: "Verification code has expired",
      };
    }

    // Hashear nueva contraseña
    const hashedPassword = await hashValue(password);

    // Actualizar usuario
    const [updatedCount, [updatedUser]] = await User.update(
      { password: hashedPassword },
      {
        where: { id: verificationCode.userId },
        returning: true, // para obtener el usuario actualizado
      }
    );

    if (!updatedUser) {
      throw new BadRequestException("Failed to reset password!");
    }

    // Borrar el código de verificación
    await verificationCode.destroy();

    // Borrar todas las sesiones del usuario
    await Session.destroy({
      where: { userId: updatedUser.id },
    });
  }

  public async logout(sessionId: number) {
    return await Session.destroy({
      where: { id: sessionId },
    });
  }
}
