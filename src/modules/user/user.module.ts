import { UsersController } from "./user.controller";
import { UserService } from "./user.service";

const userService = new UserService();
const usersController = new UsersController(userService);

export { userService, usersController };
