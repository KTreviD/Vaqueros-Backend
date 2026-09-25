import { Router } from "express";
import { playersController } from "./players.module";

const playerRoutes = Router();

playerRoutes.get("/adminPage", playersController.getAllPlayersAdminPage);
playerRoutes.post("/", playersController.postPlayer);
playerRoutes.put("/:id", playersController.putPlayer);
playerRoutes.delete("/:id", playersController.deletePlayer);

export default playerRoutes;
