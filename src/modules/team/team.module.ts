import { TeamController } from "./team.controller";
import { TeamService } from "./team.service";

const teamService = new TeamService();
const teamController = new TeamController(teamService);

export { teamService, teamController };
