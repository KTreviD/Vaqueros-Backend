import { IndustriesController } from "./industries.controller";
import { IndustriesService } from "./industries.service";

const industriesService = new IndustriesService();
const industriesController = new IndustriesController(industriesService);

export { industriesService, industriesController };
