import industryRoutes from "../modules/industries/industries.routes";
import companyRoutes from "../modules/companies/companies.routes";
import authRoutes from "../modules/auth/auth.routes";
import mfaRoutes from "../modules/mfa/mfa.routes";
import sessionRoutes from "../modules/session/session.routes";
import s3FilesRoutes from "../modules/s3_files/s3_files.routes";

export const routes = {
  // Auth
  authRoutes,
  mfaRoutes,
  sessionRoutes,

  // Rest
  companyRoutes,
  industryRoutes,
  s3FilesRoutes,
};
