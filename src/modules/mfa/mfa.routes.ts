import { Router } from "express";
import { mfaController } from "./mfa.module";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";

const mfaRoutes = Router();

mfaRoutes.put("/revoke", authenticateJWT, mfaController.revokeMFA);

mfaRoutes.post("/verify-login", mfaController.verifyMFAForLogin);
mfaRoutes.post("/resend-two-factor-code", mfaController.resendMFAForLogin);

export default mfaRoutes;
