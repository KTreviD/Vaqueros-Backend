import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { MfaService } from "./mfa.service";
import { HTTPSTATUS } from "../../config/http.config";
import {
  verifyMfaForLoginSchema,
  verifyMfaSchema,
} from "../../common/validators/mfa.validator";
import { setAuthenticationCookies } from "../../common/utils/cookies";
import { getClientIp } from "../auth/utils";

export class MfaController {
  private mfaService: MfaService;

  constructor(mfaService: MfaService) {
    this.mfaService = mfaService;
  }

  public revokeMFA = asyncHandler(async (req: Request, res: Response) => {
    const { message, userPreferences } = await this.mfaService.revokeMFA(req);
    return res.status(HTTPSTATUS.OK).json({
      message,
      userPreferences,
    });
  });

  // CHECK
  public verifyMFAForLogin = asyncHandler(
    async (req: Request, res: Response) => {
      const userAgentFront = req.headers["user-agent"];
      const body = verifyMfaForLoginSchema.parse({
        ...req.body,
        userAgent: userAgentFront,
      });
      const ip = getClientIp(req);

      const { user, session, accessToken, refreshToken } =
        await this.mfaService.verifyMFAForLogin({ ...body, ip });

      return setAuthenticationCookies({
        res,
        accessToken,
        refreshToken,
      })
        .status(HTTPSTATUS.OK)
        .json({
          message: "Verified & login successfully",
          user,
          session,
        });
    }
  );

  // CHECK
  public resendMFAForLogin = asyncHandler(
    async (req: Request, res: Response) => {
      const { email } = req.body;
      const ip = getClientIp(req);

      const { success, message } =
        await this.mfaService.resendMFAForLogin(email);

      return res.status(HTTPSTATUS.OK).json({
        message: message,
      });
    }
  );
}
