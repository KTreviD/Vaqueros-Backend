import { Request, Response } from "express";
import { PlayerService } from "./players.service";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSTATUS } from "../../config/http.config";

export class PlayersController {
  private playerService: PlayerService;

  constructor(playerService: PlayerService) {
    this.playerService = playerService;
  }

  public getAllPlayersAdminPage = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const players = await this.playerService.getAllPlayersAdminPage();

      return res.status(HTTPSTATUS.OK).send({ players });
    }
  );

  public postPlayer = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { body } = req;
      await this.playerService.create(body);

      res
        .status(HTTPSTATUS.CREATED)
        .json({ message: "El jugador ha sido agregado exitosamente." });
    }
  );

  public putPlayer = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { body } = req;
      await this.playerService.put(body);

      res
        .status(HTTPSTATUS.OK)
        .json({ message: "El jugador ha sido actualizado exitosamente." });
    }
  );

  public deletePlayer = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { id } = req.params;
      await this.playerService.delete(Number(id));

      res
        .status(HTTPSTATUS.OK)
        .json({ message: "El jugador ha sido eliminado exitosamente." });
    }
  );
}
