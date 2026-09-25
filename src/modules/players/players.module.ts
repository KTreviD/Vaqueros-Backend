import { PlayersController } from "./players.controller";
import { PlayerService } from "./players.service";

const playersService = new PlayerService();
const playersController = new PlayersController(playersService);

export { playersService, playersController };
