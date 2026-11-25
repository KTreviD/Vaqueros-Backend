import { Router } from "express";
import { teamController } from "./team.module";

const teamRoutes = Router();

teamRoutes.get("/matches/:id", teamController.getMatchData);
teamRoutes.get("/matches", teamController.getAllMatches);
teamRoutes.get("/matches/matchesLanding", teamController.getMatchesLanding);

export default teamRoutes;
