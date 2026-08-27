import { Router } from "express";
import { industriesController } from "./industries.module";

const industryRoutes = Router();

industryRoutes.get("/adminPage", industriesController.getAllIndustries);
industryRoutes.post("/", industriesController.postIndustry);
industryRoutes.put("/:id", industriesController.putIndustry);
industryRoutes.delete("/:id", industriesController.deleteIndustry);

export default industryRoutes;
