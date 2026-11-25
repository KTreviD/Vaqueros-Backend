import { Request, Response } from "express";
import { UserService } from "./user.service";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSTATUS } from "../../config/http.config";

export class UsersController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public getAllUsersAdminPage = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const users = await this.userService.getAllUsersAdminPage();

      return res.status(HTTPSTATUS.OK).send({ users });
    }
  );

  public postUser = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { body } = req;
      await this.userService.create(body);

      res
        .status(HTTPSTATUS.CREATED)
        .json({ message: "El usuario ha sido agregado exitosamente." });
    }
  );

  public putUser = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { body } = req;
      await this.userService.put(body);

      res
        .status(HTTPSTATUS.OK)
        .json({ message: "El usuario ha sido actualizado exitosamente." });
    }
  );

  public deleteUser = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { id } = req.params;
      await this.userService.delete(Number(id));

      res
        .status(HTTPSTATUS.OK)
        .json({ message: "El usuario ha sido eliminado exitosamente." });
    }
  );
}
