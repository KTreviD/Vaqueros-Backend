import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { AuthService } from "./auth.service";
import { HTTPSTATUS } from "../../config/http.config";
import {
  emailSchema,
  existVerificationCode,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verificationEmailSchema,
} from "../../common/validators/auth.validator";
import {
  clearAuthenticationCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthenticationCookies,
} from "../../common/utils/cookies";
import {
  NotFoundException,
  UnauthorizedException,
} from "../../common/utils/catch-errors";
import { getClientIp } from "./utils";
import { VerificationEnum } from "../../common/enums/verification-code.enum";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public register = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = registerSchema.parse({
        ...req.body,
      });

      await this.authService.register(body);

      return res.status(HTTPSTATUS.CREATED).json({
        message:
          "Registration successful! We’ve sent you a confirmation email — please verify your account to continue.",
      });
    }
  );

  public login = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userAgent = req.headers["user-agent"];
      const body = loginSchema.parse({
        ...req.body,
        userAgent,
      });
      const ip = getClientIp(req);

      const { user, session, accessToken, refreshToken, mfaRequired } =
        await this.authService.login({ ...body, ip });

      if (mfaRequired) {
        return res.status(HTTPSTATUS.OK).json({
          message: "Verify MFA authentication",
          mfaRequired,
          user,
        });
      }

      return setAuthenticationCookies({
        res,
        accessToken,
        refreshToken,
      })
        .status(HTTPSTATUS.OK)
        .json({
          message: "User login successfully",
          mfaRequired,
          user,
          session,
        });
    }
  );

  public refreshToken = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const refreshToken = req.cookies.refreshToken as string | undefined;
      if (!refreshToken) {
        throw new UnauthorizedException("Missing refresh token");
      }

      const { accessToken, newRefreshToken } =
        await this.authService.refreshToken(refreshToken);

      if (newRefreshToken) {
        res.cookie(
          "refreshToken",
          newRefreshToken,
          getRefreshTokenCookieOptions()
        );
      }

      return res
        .status(HTTPSTATUS.OK)
        .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
        .json({
          message: "Refresh access token successfully",
        });
    }
  );

  public verifyEmail = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userAgent = req.headers["user-agent"];
      const body = verificationEmailSchema.parse({ ...req.body, userAgent });
      const ip = getClientIp(req);

      const { user, session, accessToken, refreshToken } =
        await this.authService.verifyEmail({ ...body, ip });

      return setAuthenticationCookies({
        res,
        accessToken,
        refreshToken,
      })
        .status(HTTPSTATUS.OK)
        .json({
          message: "Email verified successfully, user logged.",
          mfaRequired: false,
          user,
          session,
        });
    }
  );

  public isEmailVerificationCodeValid = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { code } = existVerificationCode.parse({
        ...req.query,
      });
      console.log("CHECK", req.query);
      const { type } = req.query;
      console.log({ type });
      const response = await this.authService.isEmailVerificationCodeValid(
        code,
        type as string as VerificationEnum
      );

      return res.status(HTTPSTATUS.OK).json(response);
    }
  );

  public resendVerificationEmail = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { userId, type } = req.body;
      await this.authService.resendVerificationEmail(userId, type);

      return res.status(HTTPSTATUS.OK).json({
        status: 200,
        // data: user,
      });
    }
  );

  public forgotPassword = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const email = emailSchema.parse(req.body.email);
      await this.authService.forgotPassword(email);

      return res.status(HTTPSTATUS.OK).json({
        message: "Password reset email sent. Please check your inbox.",
      });
    }
  );

  public resetPassword = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = resetPasswordSchema.parse(req.body);

      await this.authService.resetPassword(body);

      return clearAuthenticationCookies(res).status(HTTPSTATUS.OK).json({
        message: "Password reset successfully",
      });
    }
  );

  // CHECK
  public logout = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const sessionId = req.sessionId;

      if (!sessionId) {
        throw new NotFoundException("Session is invalid.");
      }
      await this.authService.logout(Number(sessionId));
      return clearAuthenticationCookies(res).status(HTTPSTATUS.OK).json({
        message: "User logout successfully",
      });
    }
  );
}
