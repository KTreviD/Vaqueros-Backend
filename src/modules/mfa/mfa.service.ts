import { Request } from "express";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import {
  BadRequestException,
  TooManyRequestsException,
  UnauthorizedException,
} from "../../common/utils/catch-errors";
import { refreshTokenSignOptions, signJwtToken } from "../../common/utils/jwt";
import { Session } from "../../database/models/session";
import { User } from "../../database/models/user"; // Import del modelo Sequelize real
import { generateNumericCode, getDataFromIp } from "../auth/utils";
import { VerifyMFAForLoginDto } from "../../common/interface/mfa.interface";
import { VerificationCode } from "../../database/models/verification";
import { VerificationEnum } from "../../common/enums/verification-code.enum";
import { ErrorCode } from "../../common/enums/error-code.enum";
import { Op } from "sequelize";
import { compareValue, hashValue } from "../../common/utils/bcrypt";
import {
  calculateExpirationDate,
  fiveMinutesFromNow,
} from "../../common/utils/date_time";
import { JWT_EXPIRATIONS } from "../../config/jwt";
import { sendEmail } from "../../mailers/mailer";
import { sendMFATwoFactorCodeTemplate } from "../../mailers/templates/template";
import { logger } from "../../common/utils/logger";
import { AuthResponse, SessionResponseDto, UserResponseDto } from "../auth/dto";
import { createHash } from "crypto";

export class MfaService {
  public async revokeMFA(req: Request) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException("User not authorized");
    }

    if (!user.userPreferences.enable2FA) {
      return {
        message: "MFA is not enabled",
        userPreferences: {
          enable2FA: false,
        },
      };
    }

    await User.update(
      {
        userPreferences: {
          ...user.userPreferences,
          twoFactorSecret: null,
          enable2FA: false,
        },
      },
      { where: { id: user.id } }
    );

    return {
      message: "MFA revoked successfully",
      userPreferences: {
        enable2FA: false,
      },
    };
  }

  // CHECK
  public async verifyMFAForLogin(verifyMFAForLoginData: VerifyMFAForLoginDto) {
    const { code, email, ip, userAgent } = verifyMFAForLoginData;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_INVALID_CREDENTIALS
      );
    }

    if (
      !user.userPreferences.enable2FA
      // || !user.userPreferences.twoFactorSecret
    ) {
      throw new UnauthorizedException("MFA not enabled for this user");
    }

    // Esta verifica que haya codigo
    const verification = await VerificationCode.findOne({
      where: {
        userId: user.id,
        type: VerificationEnum.TWO_FACTOR_CODE,
      },
      order: [["createdAt", "DESC"]],
    });

    // Esta que no este expirado
    if (!verification) {
      throw new BadRequestException(
        "Invalid or expired verification code",
        ErrorCode.AUTH_MFA_INVALID
      );
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException(
        "Invalid or expired verification code",
        ErrorCode.AUTH_MFA_INVALID
      );
    }

    const isValid = await compareValue(code, verification.code);

    if (!isValid) {
      throw new BadRequestException(
        "Invalid verification code",
        ErrorCode.AUTH_MFA_INVALID_CODE
      );
    }

    ////CAMBIA// 🔥 Código usado = se elimina
    await verification.destroy();

    const dataFromIp = getDataFromIp(ip, userAgent);

    // ✅ Ahora sí crear sesión y tokens
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
      { sessionId: session.id },
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

  // CHECK
  public async resendMFAForLogin(email: string) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException(
        "Invalid email",
        ErrorCode.AUTH_INVALID_CREDENTIALS
      );
    }

    if (!user.userPreferences.enable2FA) {
      throw new UnauthorizedException(
        "MFA not enabled for this user",
        ErrorCode.AUTH_MFA_NOT_ENABLED
      );
    }

    const lastCode = await VerificationCode.findOne({
      where: {
        userId: user.id,
        type: VerificationEnum.TWO_FACTOR_CODE,
      },
      order: [["createdAt", "DESC"]],
    });

    if (lastCode) {
      const diffSeconds = (Date.now() - lastCode.createdAt.getTime()) / 1000;

      if (diffSeconds < 30) {
        throw new TooManyRequestsException(
          "Please wait before requesting another code",
          ErrorCode.AUTH_MFA_RESEND_CODE_TOO_MANY_REQUESTS
        );
      }
    }

    // 🧹 Elimina cualquier código previo
    await VerificationCode.destroy({
      where: {
        userId: user.id,
        type: VerificationEnum.TWO_FACTOR_CODE,
      },
    });

    // 🔢 Nuevo código
    const rawCode = generateNumericCode(6);
    const hashedCode = await hashValue(rawCode);
    const lookupKey = createHash("sha256").update(rawCode).digest("hex");

    // 📧 Envía correo
    await sendEmail({
      to: user.email,
      ...sendMFATwoFactorCodeTemplate(rawCode),
    });

    // 💾 Guarda solo el hash
    await VerificationCode.create({
      userId: user.id,
      code: hashedCode,
      lookupKey,
      type: VerificationEnum.TWO_FACTOR_CODE,
      expiresAt: fiveMinutesFromNow(),
    });

    logger.info(`MFA code resent for user ID: ${user.id}`);

    return {
      success: true,
      message: "Verification code resent",
    };
  }
}
