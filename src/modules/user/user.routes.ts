import { Router } from "express";
import { usersController } from "./user.module";

const userRoutes = Router();

userRoutes.get("/adminPage", usersController.getAllUsersAdminPage);
userRoutes.post("/", usersController.postUser);
userRoutes.put("/:id", usersController.putUser);
userRoutes.delete("/:id", usersController.deleteUser);

export default userRoutes;
