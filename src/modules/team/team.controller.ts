import { Request, Response } from "express";
import { TeamService } from "./team.service";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSTATUS } from "../../config/http.config";

export class TeamController {
  private teamService: TeamService;

  constructor(teamService: TeamService) {
    this.teamService = teamService;
  }

  public getAllMatches = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const matches = await this.teamService.findAll();

      return res.status(HTTPSTATUS.OK).send(matches);
    }
  );

  public getMatchesLanding = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { next, last } = await this.teamService.getMatchesLanding();

      return res.status(HTTPSTATUS.OK).send({ next, last });
    }
  );

  public getMatchData = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      console.log("Entre");
      const matchId = Number(req.params.id);
      const localTeamId = Number(req.query.localTeamId);
      const awayTeamId = Number(req.query.awayTeamId);

      const data = await this.teamService.getMatchData(
        matchId,
        localTeamId,
        awayTeamId
      );

      return res.status(HTTPSTATUS.OK).send(data);
    }
  );
}
