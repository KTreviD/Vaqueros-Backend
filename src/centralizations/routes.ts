import authRoutes from "../modules/auth/auth.routes";
import mfaRoutes from "../modules/mfa/mfa.routes";
import sessionRoutes from "../modules/session/session.routes";
import s3FilesRoutes from "../modules/s3_files/s3_files.routes";
import playerRoutes from "../modules/players/players.routes";
import userRoutes from "../modules/user/user.routes";
import teamRoutes from "../modules/team/team.routes";

export const routes = {
  // Auth
  authRoutes,
  mfaRoutes,
  sessionRoutes,

  // Rest
  playerRoutes,
  userRoutes,
  teamRoutes,
  s3FilesRoutes,
};
