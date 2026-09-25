import { NotFoundError } from "../../common/utils/customError";
import { industriesService } from "../industries/industries.module";
import { Player } from "../../database/models/player";

export class PlayerService {
  //Individuales
  public async findAll() {
    return Player.findAll({
      order: [["created_at", "DESC"]],
    });
  }

  public async create(body: any) {
    await Player.create({
      ...body,
    });
  }

  public async put(body: any) {
    const player = await Player.findByPk(body.id);
    if (!player) throw new NotFoundError("El jugador con ese ID no existe.");

    await player.update(body);
  }

  public async delete(id: number) {
    const player = await Player.findByPk(id);
    if (!player) throw new NotFoundError("El jugador con ese ID no existe.");

    await player.destroy();
  }

  //Combinados
  public async getAllPlayersAdminPage() {
    const players = await Player.findAll({
      order: [["created_at", "DESC"]],
    });

    return { players };
  }
}
